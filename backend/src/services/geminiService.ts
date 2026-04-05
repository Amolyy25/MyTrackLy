/**
 * Gemini AI Service
 * Uses Google Gemini 1.5 Flash API (free tier)
 * Env var: GEMINI_API_KEY
 */

export interface GeminiContext {
  user: { name: string; goalType: string | null; role: string };
  plan: {
    name: string;
    bodyGoal: string | null;
    targetWeightKg: number | null;
    customGoal: string | null;
    initialNotes: string | null;
    days: Array<{
      trainingType: string;
      label: string | null;
      dayOfWeek: number;
      timeOfDay: string;
    }>;
  };
  recentSessions: Array<{
    date: Date;
    durationMinutes: number | null;
    notes: string | null;
    exercises: any[];
  }>;
  recentMoodLogs: Array<{
    date: Date;
    moodScore: number | null;
    moodNote: string | null;
    performanceNote: string | null;
  }>;
  latestMeasurement: {
    bodyWeightKg: number | null;
    waistCm: number | null;
    chestCm: number | null;
  } | null;
  weightTrend: number | null;
}

export interface AISuggestion {
  type: "advice" | "warning" | "motivation";
  title: string;
  content: string;
  actions?: Array<{
    id: string;
    label: string;
    type: "shift_day" | "change_plan" | "ask_question" | "add_exercise" | "other";
    payload?: any;
  }>;
}

const FALLBACK_SUGGESTION: AISuggestion = {
  type: "advice",
  title: "Donnees insuffisantes",
  content:
    "Connectez-vous regulierement et enregistrez vos seances pour obtenir des conseils personnalises.",
};

const DAY_NAMES = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function buildPrompt(ctx: GeminiContext): string {
  const daysDescription = ctx.plan.days
    .map(
      (d) =>
        `  - ${DAY_NAMES[d.dayOfWeek]} a ${d.timeOfDay}: ${d.trainingType}${d.label ? ` (${d.label})` : ""}`
    )
    .join("\n");

  const sessionsDescription =
    ctx.recentSessions.length > 0
      ? ctx.recentSessions
          .map(
            (s) =>
              `  - ${new Date(s.date).toLocaleDateString("fr-FR")}${s.durationMinutes ? ` (${s.durationMinutes}min)` : ""}${s.notes ? `: ${s.notes}` : ""}`
          )
          .join("\n")
      : "  Aucune seance recente";

  const moodDescription =
    ctx.recentMoodLogs.length > 0
      ? ctx.recentMoodLogs
          .map(
            (m) =>
              `  - ${new Date(m.date).toLocaleDateString("fr-FR")}: humeur ${m.moodScore}/5${m.moodNote ? ` - ${m.moodNote}` : ""}${m.performanceNote ? ` | Performance: ${m.performanceNote}` : ""}`
          )
          .join("\n")
      : "  Aucune donnee d'humeur";

  const measurementDescription = ctx.latestMeasurement
    ? `Poids: ${ctx.latestMeasurement.bodyWeightKg ?? "N/A"} kg, Tour de taille: ${ctx.latestMeasurement.waistCm ?? "N/A"} cm, Tour de poitrine: ${ctx.latestMeasurement.chestCm ?? "N/A"} cm`
    : "Aucune mensuration disponible";

  const weightTrendDescription =
    ctx.weightTrend !== null
      ? `${ctx.weightTrend > 0 ? "+" : ""}${ctx.weightTrend.toFixed(1)} kg sur les 30 derniers jours`
      : "Pas assez de donnees pour calculer la tendance";

  return `Tu es MyTrackLy AI, un coach sportif de haut niveau (expert en musculation, physiologie et psychologie du sport). Ta mission est de transformer les données brutes en conseils d'expert ultra-concrets.

TON ANALYSE DOIT PORTER SUR :
1. LA SURCHARGE PROGRESSIVE : Vérifie si le volume (séries/reps) augmente. Si stagnation > 2 semaines, propose une action.
2. LA COHÉRENCE RÉCUPÉRATION/EFFORT : Si l'humeur ou la performance baisse, suggère un jour de repos ou un deload.
3. ADAPTATION DU PLANNING : Si des séances sont sautées le même jour chaque semaine, propose de DÉCALER la séance (action shift_day).
4. ENGAGEMENT : Pose des questions pour affiner la stratégie (action ask_question).

TON STYLE : Pionnier, motivant mais scientifique. Pas de blabla, de l'action.

INTERACTIVITÉ OBLIGATOIRE :
Utilise le champ "actions" dès que possible pour :
- Proposer de décaler une séance manquée.
- Proposer un nouvel exercice plus adapté si stagnation.
- Poser une question précise pour adapter le plan (ex: "Ressens-tu une douleur ?", "Ton sommeil est-il bon ?").

FORMAT JSON MÉTIER :
{
  "suggestions": [
    {
      "type": "advice|warning|motivation",
      "title": "Titre court & percutant",
      "content": "Analyse précise avec explication technique courte.",
      "actions": [
        {
          "id": "...",
          "label": "Bouton d'action",
          "type": "shift_day|change_plan|ask_question|add_exercise|other",
          "payload": { ... }
        }
      ]
    }
  ]
}

Données du sportif:
- Nom: ${ctx.user.name}
- Objectif: ${ctx.user.goalType ?? "Non défini"}
- Plan: ${ctx.plan.name} (objectif: ${ctx.plan.bodyGoal ?? "Non défini"})
- Notes initiales: ${ctx.plan.initialNotes ?? "Aucune"}

Planning:
${daysDescription}

Historique séances & Humeur:
${sessionsDescription}
${moodDescription}

Mensurations: ${measurementDescription}
Tendance: ${weightTrendDescription}`;
}

export async function getAISuggestions(
  ctx: GeminiContext
): Promise<AISuggestion[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[GEMINI] GEMINI_API_KEY not set, returning fallback");
    return [FALLBACK_SUGGESTION];
  }

  try {
    const prompt = buildPrompt(ctx);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[GEMINI] API error:", response.status, errorText);
      return [FALLBACK_SUGGESTION];
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("[GEMINI] No text in response:", JSON.stringify(data));
      return [FALLBACK_SUGGESTION];
    }

    // Parse JSON from response (may be wrapped in markdown code block)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[GEMINI] No JSON found in response:", text);
      return [FALLBACK_SUGGESTION];
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (
      !parsed.suggestions ||
      !Array.isArray(parsed.suggestions) ||
      parsed.suggestions.length === 0
    ) {
      console.error("[GEMINI] Invalid suggestions format:", parsed);
      return [FALLBACK_SUGGESTION];
    }

    // Validate each suggestion
    const validTypes = ["advice", "warning", "motivation"];
    const suggestions: AISuggestion[] = parsed.suggestions
      .filter(
        (s: any) =>
          s &&
          typeof s.title === "string" &&
          typeof s.content === "string" &&
          validTypes.includes(s.type)
      )
      .map((s: any) => ({
        ...s,
        actions: Array.isArray(s.actions) ? s.actions : undefined
      }))
      .slice(0, 5);

    return suggestions.length > 0 ? suggestions : [FALLBACK_SUGGESTION];
  } catch (error) {
    console.error("[GEMINI] Error:", error);
    return [FALLBACK_SUGGESTION];
  }
}
