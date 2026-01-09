import { google } from "googleapis";
import prisma from "../config/database";

// On utilise le scope complet "calendar" pour pouvoir à la fois
// lister les calendriers et créer des événements.
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUri = process.env.GOOGLE_REDIRECT_URI;

if (!clientId || !clientSecret || !redirectUri) {
  console.warn(
    "[GoogleCalendar] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI manquants dans l'environnement"
  );
}

function getOAuth2Client() {
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Configuration Google OAuth2 manquante (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI)"
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function generateAuthUrl(state?: string) {
  const oAuth2Client = getOAuth2Client();

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });

  return url;
}

export async function handleOAuthCallback(code: string, userId: string) {
  const oAuth2Client = getOAuth2Client();

  const { tokens } = await oAuth2Client.getToken(code);

  oAuth2Client.setCredentials(tokens);

  const tokenInfo = await oAuth2Client.getTokenInfo(tokens.access_token || "");

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });
  const calendarList = await calendar.calendarList.list();
  const primaryCalendar =
    calendarList.data.items?.find((cal) => cal.primary) ||
    calendarList.data.items?.[0];

  // Mettre à jour les tokens
  await prisma.user.update({
    where: { id: userId },
    data: {
      googleCalendarAccessToken: tokens.access_token || null,
      googleCalendarRefreshToken: tokens.refresh_token || null,
      googleCalendarExpiry: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : null,
      googleCalendarId: primaryCalendar?.id || null,
    },
  });

  // Créer automatiquement le calendrier dédié "Séances MyTrackLy" si pas déjà créé
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { myTrackLyCalendarId: true },
  });

  if (!user?.myTrackLyCalendarId) {
    const dedicatedCalendarId = await createSecondaryCalendar(userId);
    if (dedicatedCalendarId) {
      await prisma.user.update({
        where: { id: userId },
        data: { myTrackLyCalendarId: dedicatedCalendarId },
      });
    }
  }

  return {
    scopes: tokenInfo.scopes,
    calendarId: primaryCalendar?.id || null,
  };
}

/**
 * Crée un calendrier secondaire dédié pour l'application
 * Fonctionne pour les coaches et les élèves
 */
export async function createSecondaryCalendar(
  userId: string,
  summary: string = "Séances MyTrackLy"
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (
      !user ||
      !user.googleCalendarAccessToken ||
      !user.googleCalendarRefreshToken
    ) {
      return null;
    }

    const oAuth2Client = getOAuth2Client();
    oAuth2Client.setCredentials({
      access_token: user.googleCalendarAccessToken,
      refresh_token: user.googleCalendarRefreshToken,
      expiry_date: user.googleCalendarExpiry
        ? user.googleCalendarExpiry.getTime()
        : undefined,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const newCalendar = await calendar.calendars.insert({
      requestBody: {
        summary,
        timeZone:
          process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE || "Europe/Paris",
      },
    });

    return newCalendar.data.id || null;
  } catch (err) {
    console.error(
      "[GoogleCalendar] Erreur lors de la création du calendrier secondaire",
      err
    );
    return null;
  }
}

/**
 * Fonction générique pour obtenir un client OAuth2 autorisé pour un utilisateur (coach ou élève)
 */
async function getAuthorizedClientForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Utilisateur introuvable");
  }

  if (!user.googleCalendarAccessToken || !user.googleCalendarRefreshToken) {
    throw new Error(
      "L'utilisateur n'a pas encore connecté son Google Calendar"
    );
  }

  const oAuth2Client = getOAuth2Client();

  oAuth2Client.setCredentials({
    access_token: user.googleCalendarAccessToken,
    refresh_token: user.googleCalendarRefreshToken,
    expiry_date: user.googleCalendarExpiry
      ? user.googleCalendarExpiry.getTime()
      : undefined,
  });

  oAuth2Client.on("tokens", async (tokens) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleCalendarAccessToken:
            tokens.access_token || user.googleCalendarAccessToken,
          googleCalendarRefreshToken:
            tokens.refresh_token || user.googleCalendarRefreshToken,
          googleCalendarExpiry: tokens.expiry_date
            ? new Date(tokens.expiry_date)
            : user.googleCalendarExpiry,
        },
      });
    } catch (err) {
      console.error(
        "[GoogleCalendar] Erreur lors de la mise à jour des tokens",
        err
      );
    }
  });

  // Utiliser le calendrier secondaire s'il existe, sinon le calendrier configuré (primary par défaut)
  const calendarId =
    user.myTrackLyCalendarId || user.googleCalendarId || "primary";

  return {
    oAuth2Client,
    user,
    calendarId,
  };
}

/**
 * Alias pour compatibilité avec le code existant
 */
async function getAuthorizedClientForCoach(coachId: string) {
  const result = await getAuthorizedClientForUser(coachId);
  if (result.user.role !== "coach") {
    throw new Error("L'utilisateur n'est pas un coach");
  }
  return {
    oAuth2Client: result.oAuth2Client,
    coach: result.user,
    calendarId: result.calendarId,
  };
}

interface CreateCalendarEventParams {
  coachId: string;
  startDateTime: Date;
  endDateTime: Date;
  summary: string;
  description?: string;
  timezone?: string;
}

/**
 * Convertit une Date UTC en format ISO sans Z dans le timezone spécifié
 * Google Calendar interprète le dateTime comme étant dans le timezone spécifié,
 * pas UTC, donc on doit convertir en format local.
 */
function formatDateTimeForGoogleCalendar(date: Date, timeZone: string): string {
  // Utiliser Intl.DateTimeFormat pour formater la date dans le timezone spécifié
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  const second = parts.find((p) => p.type === "second")?.value;

  // Valider que toutes les parties de date ont été trouvées
  if (!year || !month || !day || !hour || !minute || !second) {
    throw new Error(
      `Impossible de formater la date dans le timezone ${timeZone}. Parties manquantes: ${JSON.stringify(
        { year, month, day, hour, minute, second }
      )}`
    );
  }

  // Format: YYYY-MM-DDTHH:mm:ss (sans Z pour indiquer que c'est dans le timezone spécifié)
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

export async function createEventInCoachCalendar(
  params: CreateCalendarEventParams
) {
  const {
    coachId,
    startDateTime,
    endDateTime,
    summary,
    description,
    timezone,
  } = params;

  const { oAuth2Client, calendarId } = await getAuthorizedClientForCoach(
    coachId
  );

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const timeZone =
    timezone || process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE || "Europe/Paris";

  const event = {
    summary,
    description,
    start: {
      dateTime: formatDateTimeForGoogleCalendar(startDateTime, timeZone),
      timeZone,
    },
    end: {
      dateTime: formatDateTimeForGoogleCalendar(endDateTime, timeZone),
      timeZone,
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  return response.data;
}

/**
 * Crée un événement dans le calendrier de l'élève
 */
export async function createEventInStudentCalendar(
  studentId: string,
  params: {
    startDateTime: Date;
    endDateTime: Date;
    summary: string;
    description?: string;
    timezone?: string;
  }
) {
  const { oAuth2Client, calendarId } = await getAuthorizedClientForUser(
    studentId
  );

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const timeZone =
    params.timezone ||
    process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE ||
    "Europe/Paris";

  const event = {
    summary: params.summary,
    description: params.description,
    start: {
      dateTime: formatDateTimeForGoogleCalendar(params.startDateTime, timeZone),
      timeZone,
    },
    end: {
      dateTime: formatDateTimeForGoogleCalendar(params.endDateTime, timeZone),
      timeZone,
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  return response.data;
}

export async function updateEventInCoachCalendar(
  coachId: string,
  eventId: string,
  params: {
    startDateTime: Date;
    endDateTime: Date;
    summary?: string;
    description?: string;
    timezone?: string;
  }
) {
  const { oAuth2Client, calendarId } = await getAuthorizedClientForCoach(
    coachId
  );

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const timeZone =
    params.timezone ||
    process.env.GOOGLE_CALENDAR_DEFAULT_TIMEZONE ||
    "Europe/Paris";

  const event = {
    start: {
      dateTime: formatDateTimeForGoogleCalendar(params.startDateTime, timeZone),
      timeZone,
    },
    end: {
      dateTime: formatDateTimeForGoogleCalendar(params.endDateTime, timeZone),
      timeZone,
    },
    summary: params.summary,
    description: params.description,
  };

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: event,
  });

  return response.data;
}

export async function deleteEventFromCoachCalendar(
  coachId: string,
  eventId: string
) {
  const { oAuth2Client, calendarId } = await getAuthorizedClientForCoach(
    coachId
  );

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

/**
 * Vérifie les conflits d'agenda sur Google Calendar
 * Retourne true si au moins un conflit est trouvé, false sinon
 */
export async function checkGoogleCalendarConflicts(
  coachId: string,
  start: Date,
  end: Date,
  timeZone: string = "Europe/Paris"
): Promise<boolean> {
  try {
    const { oAuth2Client, calendarId } = await getAuthorizedClientForCoach(
      coachId
    );

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // freebusy attend des dates ISO UTC
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone,
        items: [{ id: calendarId }],
      },
    });

    const busySlots = response.data.calendars?.[calendarId]?.busy;

    if (!busySlots || busySlots.length === 0) {
      return false;
    }

    // S'il y a des créneaux busy, il y a conflit
    return true;
  } catch (error) {
    console.error(
      "[GoogleCalendar] Erreur lors de la vérification des conflits:",
      error
    );
    // En cas d'erreur (ex: token expiré, API down), on ne bloque pas par défaut
    // ou on bloque par sécurité. Ici on choisit de ne pas bloquer mais de logger.
    return false;
  }
}

/**
 * Récupère les plages occupées (busy) sur Google Calendar pour une période donnée
 */
export async function getGoogleCalendarBusySlots(
  coachId: string,
  start: Date,
  end: Date,
  timeZone: string = "Europe/Paris"
): Promise<{ start: Date; end: Date }[]> {
  try {
    const { oAuth2Client, calendarId } = await getAuthorizedClientForCoach(
      coachId
    );

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // freebusy attend des dates ISO UTC
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone,
        items: [{ id: calendarId }],
      },
    });

    const busySlots = response.data.calendars?.[calendarId]?.busy;

    if (!busySlots) {
      return [];
    }

    return busySlots.map((slot) => ({
      start: new Date(slot.start || ""),
      end: new Date(slot.end || ""),
    }));
  } catch (error) {
    console.error(
      "[GoogleCalendar] Erreur lors de la récupération des créneaux occupés:",
      error
    );
    return [];
  }
}
