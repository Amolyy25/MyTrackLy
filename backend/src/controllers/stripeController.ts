import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../config/database";
import { syncReservationToGoogleCalendar } from "./calendarController";
import { sendEmail } from "../email/emailService";
import { formatDateTimeFrench } from "../email/emailUtils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia" as any,
});

// Commission MyTrackLy (%)
const PLATFORM_FEE_PERCENT = 10;

/**
 * Créer un compte Stripe Connect Express pour un coach
 */
export async function createConnectAccount(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== "coach") {
      return res
        .status(403)
        .json({ message: "Seul un coach peut créer un compte Stripe." });
    }

    if (user.stripeAccountId) {
      return res
        .status(400)
        .json({ message: "Ce coach a déjà un compte Stripe." });
    }

    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      settings: {
        payouts: {
          schedule: {
            interval: "manual",
          },
        },
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeAccountId: account.id },
    });

    res.json({ stripeAccountId: account.id });
  } catch (error) {
    console.error("Create Connect Account Error:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création du compte Stripe." });
  }
}

/**
 * Générer un lien d'onboarding (Account Link)
 */
export async function createAccountLink(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeAccountId) {
      return res.status(400).json({ message: "Compte Stripe non trouvé." });
    }

    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/dashboard/payments?stripe=refresh`,
      return_url: `${process.env.FRONTEND_URL}/dashboard/payments?stripe=success`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Create Account Link Error:", error);
    res.status(500).json({ message: "Erreur lors de la génération du lien." });
  }
}

/**
 * Générer un lien vers le Dashboard Express
 */
export async function createLoginLink(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeAccountId) {
      return res.status(400).json({ message: "Compte Stripe non trouvé." });
    }

    const loginLink = await stripe.accounts.createLoginLink(
      user.stripeAccountId,
    );
    res.json({ url: loginLink.url });
  } catch (error) {
    console.error("Create Login Link Error:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la génération du lien dashboard." });
  }
}

/**
 * Synchroniser manuellement le statut du compte Stripe Connect
 */
export async function syncAccountStatus(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.stripeAccountId) {
      return res.status(400).json({ message: "Compte Stripe non trouvé." });
    }

    // Récupérer les infos fraîches depuis Stripe
    const account = await stripe.accounts.retrieve(user.stripeAccountId);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeOnboardingComplete: account.details_submitted,
      },
      select: {
        stripeAccountId: true,
        stripeOnboardingComplete: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Sync Account Status Error:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la synchronisation avec Stripe." });
  }
}

/**
 * Récupérer les revenus et transactions réels du coach
 */
export async function getEarnings(req: Request, res: Response) {
  try {
    const coachId = (req as any).user?.userId;

    const reservations = await prisma.reservation.findMany({
      where: {
        coachId,
        isPaid: true,
      },
      orderBy: {
        startDateTime: "desc",
      },
      include: {
        student: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Calcul du total généré (net pour le coach)
    const totalEarnings = reservations.reduce((acc, res) => {
      const earning = res.coachEarning ?? (res.totalPrice || 0) * 0.9;
      return acc + earning;
    }, 0);

    // Formatage des transactions pour le frontend
    const transactions = reservations.map((res) => {
      const coachEarning = res.coachEarning ?? (res.totalPrice || 0) * 0.9;
      return {
        id: res.id,
        studentName: res.student?.name || res.guestName || "Inconnu",
        amount: res.totalPrice,
        coachEarning: coachEarning,
        date: res.startDateTime,
        sessionType: res.sessionType,
        invoiceUrl: res.stripeInvoiceUrl,
      };
    });

    // Calcul des revenus par client
    const revenueByClientMap = new Map<
      string,
      { studentName: string; totalRevenue: number; sessionCount: number }
    >();
    reservations.forEach((res) => {
      const coachEarning = res.coachEarning ?? (res.totalPrice || 0) * 0.9;
      const clientName = res.student?.name || res.guestName || "Inconnu";
      if (revenueByClientMap.has(clientName)) {
        const d = revenueByClientMap.get(clientName)!;
        d.totalRevenue += coachEarning;
        d.sessionCount += 1;
      } else {
        revenueByClientMap.set(clientName, {
          studentName: clientName,
          totalRevenue: coachEarning,
          sessionCount: 1,
        });
      }
    });

    const revenueByClient = Array.from(revenueByClientMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5); // Les 5 meilleurs clients

    res.json({
      totalEarnings,
      transactionCount: transactions.length,
      transactions: transactions.slice(0, 10), // On envoie les 10 dernières
      revenueByClient,
    });
  } catch (error) {
    console.error("Get Earnings Error:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des revenus." });
  }
}

/**
 * Récupérer les statistiques de revenus (mois en cours vs mois dernier)
 */
export async function getRevenueStats(req: Request, res: Response) {
  try {
    const coachId = (req as any).user?.userId;
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1); // 1er du mois en cours = fin du mois dernier exclus

    const paidReservations = await prisma.reservation.findMany({
      where: {
        coachId,
        isPaid: true,
        startDateTime: {
          gte: lastMonthStart,
        },
      },
      select: {
        totalPrice: true,
        startDateTime: true,
      },
    });

    const currentMonthRevenue = paidReservations
      .filter((r) => new Date(r.startDateTime) >= currentMonthStart)
      .reduce((acc, r) => acc + (r.totalPrice || 0), 0);

    const lastMonthRevenue = paidReservations
      .filter((r) => {
        const d = new Date(r.startDateTime);
        return d >= lastMonthStart && d < currentMonthStart;
      })
      .reduce((acc, r) => acc + (r.totalPrice || 0), 0);

    let evolution = 0;
    if (lastMonthRevenue > 0) {
      evolution =
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      evolution = 100; // Si 0 le mois dernier mais > 0 ce mois-ci
    }

    res.json({
      currentMonthRevenue,
      lastMonthRevenue,
      evolution: parseFloat(evolution.toFixed(1)),
    });
  } catch (error) {
    console.error("Get Revenue Stats Error:", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des stats de revenus.",
    });
  }
}

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const { reservationId } = req.body;
    const userId = (req as any).user?.userId;

    if (!reservationId) {
      return res.status(400).json({ message: "reservationId est requis." });
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: { select: { name: true } },
      },
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée." });
    }

    if (reservation.studentId !== userId) {
      return res
        .status(403)
        .json({ message: "Vous n'avez pas accès à cette réservation." });
    }

    if (reservation.isPaid) {
      return res
        .status(400)
        .json({ message: "Cette réservation est déjà payée." });
    }

    if (!reservation.totalPrice || reservation.totalPrice <= 0) {
      return res
        .status(400)
        .json({ message: "Le prix de la réservation est invalide." });
    }

    const coach = await prisma.user.findUnique({
      where: { id: reservation.coachId },
    });

    if (!coach?.stripeAccountId || !coach.stripeChargesEnabled) {
      return res
        .status(400)
        .json({ message: "Le coach n'a pas encore activé ses paiements." });
    }

    // Calcul commission MyTrackLy
    const applicationFee = Math.round(
      reservation.totalPrice * PLATFORM_FEE_PERCENT,
    ); // en centimes si totalPrice est déjà en euros? Non totalPrice est en Float (Euros)
    const applicationFeeCentimes = Math.round(
      reservation.totalPrice * (PLATFORM_FEE_PERCENT / 100) * 100,
    );

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Séance de coaching avec ${reservation.coach.name}`,
                description: `Séance du ${new Date(reservation.startDateTime).toLocaleDateString("fr-FR")}`,
              },
              unit_amount: Math.round(reservation.totalPrice * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/dashboard/reservations?payment=success&reservationId=${reservationId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/dashboard/reservations?payment=cancel`,
        payment_intent_data: {
          application_fee_amount: applicationFeeCentimes,
        },
        metadata: {
          reservationId: reservation.id,
        },
        invoice_creation: {
          enabled: true,
        },
      },
      {
        stripeAccount: coach.stripeAccountId, // <--- DIRECT CHARGE
      },
    );

    // Stocker l'ID de session
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripeSessionId: session.id,
        platformFee: applicationFeeCentimes / 100,
        coachEarning: reservation.totalPrice - applicationFeeCentimes / 100,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({
      message: "Erreur lors de la création de la session de paiement.",
    });
  }
}

export async function createPublicCheckoutRedirect(req: Request, res: Response) {
  try {
    const { reservationId } = req.params;

    if (!reservationId) {
      return res.status(400).send("Réservation introuvable.");
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: { select: { name: true, stripeAccountId: true, stripeChargesEnabled: true } },
      },
    });

    if (!reservation || !reservation.guestEmail) {
      return res.redirect(`${process.env.FRONTEND_URL}/?error=reservation_not_found`);
    }

    if (reservation.isPaid) {
      return res.redirect(`${process.env.FRONTEND_URL}/?message=already_paid`);
    }

    if (!reservation.totalPrice || reservation.totalPrice <= 0) {
      return res.redirect(`${process.env.FRONTEND_URL}/?message=free_session`);
    }

    const coach = reservation.coach;

    if (!coach?.stripeAccountId || !coach.stripeChargesEnabled) {
      return res.redirect(`${process.env.FRONTEND_URL}/?error=coach_payments_not_enabled`);
    }

    const applicationFeeCentimes = Math.round(
      reservation.totalPrice * (PLATFORM_FEE_PERCENT / 100) * 100,
    );

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        customer_email: reservation.guestEmail,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `Séance de coaching avec ${coach.name}`,
                description: `Séance du ${new Date(reservation.startDateTime).toLocaleDateString("fr-FR")}`,
              },
              unit_amount: Math.round(reservation.totalPrice * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/?payment=success&reservationId=${reservationId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/?payment=cancel`,
        payment_intent_data: {
          application_fee_amount: applicationFeeCentimes,
        },
        metadata: {
          reservationId: reservation.id,
        },
        invoice_creation: {
          enabled: true,
        },
      },
      {
        stripeAccount: coach.stripeAccountId,
      },
    );

    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        stripeSessionId: session.id,
        platformFee: applicationFeeCentimes / 100,
        coachEarning: reservation.totalPrice - applicationFeeCentimes / 100,
      },
    });

    if (session.url) {
      res.redirect(303, session.url);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/?error=stripe_error`);
    }
  } catch (error) {
    console.error("Public Stripe Checkout Error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/?error=server_error`);
  }
}


export async function verifySession(req: Request, res: Response) {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId requis" });
    }

    const reservation = await prisma.reservation.findFirst({
      where: { stripeSessionId: sessionId as string },
      include: { coach: true },
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation introuvable." });
    }

    const options = reservation.coach.stripeAccountId
      ? { stripeAccount: reservation.coach.stripeAccountId }
      : {};

    const session = await stripe.checkout.sessions.retrieve(
      sessionId as string,
      options,
    );

    if (session.payment_status === "paid" && reservation.id) {
      if (!reservation.isPaid) {
        await prisma.reservation.update({
          where: { id: reservation.id },
          data: {
            isPaid: true,
            status: "confirmed",
          },
        });
        await syncReservationToGoogleCalendar(reservation.id);
      }
      return res.json({ status: "paid" });
    }

    res.json({ status: session.payment_status });
  } catch (error) {
    console.error("Verify Session Error:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la vérification de la session" });
  }
}

export async function verifySubscriptionSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ message: "sessionId requis" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId as string);
    if (session.status === "complete") {
      await handleSubscriptionCheckoutCompleted(session); // Will update DB synchronously
      return res.json({ status: "complete" });
    }

    res.json({ status: session.status });
  } catch (error) {
    console.error("Verify Subscription Session Error:", error);
    res.status(500).json({ message: "Erreur lors de la vérification de la session d'abonnement" });
  }
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("⚠️ STRIPE_WEBHOOK_SECRET non configuré. Webhooks ignorés.");
    return res
      .status(200)
      .json({ received: false, message: "Webhook secret missing" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handlePaymentSuccess(session);
    await handleSubscriptionCheckoutCompleted(session);
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await handleSubscriptionUpdated(subscription);
  }

  res.json({ received: true });
}

/**
 * Logique partagée pour traiter un paiement réussi
 */
async function handlePaymentSuccess(
  session: Stripe.Checkout.Session,
  stripeAccountId?: string,
) {
  const reservationId = session.metadata?.reservationId;

  if (reservationId) {
    // Récupérer les infos de l'invoice si elle a été générée
    let invoiceUrl = null;
    let invoiceId = null;

    if (session.invoice) {
      // Si c'est un Direct Charge, l'invoice appartient au compte connecté
      const options = stripeAccountId ? { stripeAccount: stripeAccountId } : {};
      const invoice = await stripe.invoices.retrieve(
        session.invoice as string,
        options,
      );
      invoiceUrl = invoice.hosted_invoice_url;
      invoiceId = invoice.id;
    }

    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        isPaid: true,
        status: "confirmed",
        stripeInvoiceUrl: invoiceUrl,
        stripeInvoiceId: invoiceId,
      },
    });

    await syncReservationToGoogleCalendar(reservationId);

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: { select: { email: true, name: true } },
        student: { select: { email: true, name: true } },
      },
    });

    if (reservation && reservation.coach) {
      const dateTimeStr = formatDateTimeFrench(reservation.startDateTime);
      const amountStr = (reservation.totalPrice || 0).toString();
      const studentNameOrGuest = reservation.student?.name || reservation.guestName || "Utilisateur";
      const studentEmailOrGuest = reservation.student?.email || reservation.guestEmail;

      if (studentEmailOrGuest) {
        await sendEmail(
          studentEmailOrGuest,
          "Paiement confirmé - MyTrackLy",
          "paymentSuccessStudent",
          {
            name: studentNameOrGuest,
            reservationDateTime: dateTimeStr,
            amount: amountStr,
            sessionType: reservation.sessionType,
            coachName: reservation.coach.name,
          },
        );
      }

      if (reservation.coach.email) {
        await sendEmail(
          reservation.coach.email,
          "Paiement reçu - MyTrackLy",
          "paymentSuccessCoach",
          {
            coachName: reservation.coach.name,
            studentName: studentNameOrGuest,
            reservationDateTime: dateTimeStr,
            amount: amountStr,
            sessionType: reservation.sessionType,
          },
        );
      }
    }
  }
}

async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId; // Renseigné uniquement pour les utilisateurs déjà connectés

  if (userId && session.mode === "subscription") {
    let stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    let stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    let stripeSubscriptionStatus = "active";

    if (stripeSubscriptionId) {
       try {
         const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
         stripeSubscriptionStatus = sub.status;
         // On met à jour le owner ID sur la metadata Stripe au cas où
         await stripe.subscriptions.update(stripeSubscriptionId, { metadata: { userId } });
         if (stripeCustomerId) {
           await stripe.customers.update(stripeCustomerId, { metadata: { userId } });
         }
       } catch (error) {
         console.error("Retrieving subscription error:", error);
       }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeCustomerId: stripeCustomerId || undefined,
        stripeSubscriptionId: stripeSubscriptionId || undefined,
        stripeSubscriptionStatus: stripeSubscriptionStatus,
      }
    });
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const status = subscription.status;

  const user = await prisma.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (user) {
     await prisma.user.update({
        where: { id: user.id },
        data: {
           stripeSubscriptionId: subscription.id,
           stripeSubscriptionStatus: status
        }
     });
  }
}

/**
 * Webhook pour les mises à jour de comptes Connect (KYC + Paiements Connectés)
 */
export async function handleStripeConnectWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(200).json({ received: false });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const stripeAccountId = event.account; // L'ID du compte connecté qui a généré l'event

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;

    await prisma.user.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeOnboardingComplete: account.details_submitted,
      },
    });
  }

  // Pour les Direct Charges, les événements de paiement tombent ici
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await handlePaymentSuccess(session, stripeAccountId);
  }

  res.json({ received: true });
}

export async function createSubscriptionCheckout(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Le plan est requis." });
    }

    const priceIds: Record<string, string> = {
      personnel: process.env.STRIPE_PRICE_ID_PERSONNEL || "price_dummy_personnel",
      coach: process.env.STRIPE_PRICE_ID_COACH || "price_dummy_coach"
    };

    const priceId = priceIds[planId];
    if (!priceId) {
      return res.status(400).json({ message: "Plan invalide." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
      },
      // User is authenticated, skip registration
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment?plan=${planId}&canceled=true`,
      metadata: {
        userId: userId,
        planId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Create Subscription Checkout Error:", error);
    res.status(500).json({ message: "Erreur lors de la création de la session de paiement." });
  }
}

export async function createPublicSubscriptionCheckout(req: Request, res: Response) {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Le plan est requis." });
    }

    const priceIds: Record<string, string> = {
      personnel: process.env.STRIPE_PRICE_ID_PERSONNEL || "price_dummy_personnel",
      coach: process.env.STRIPE_PRICE_ID_COACH || "price_dummy_coach"
    };

    const priceId = priceIds[planId];
    if (!priceId) {
      return res.status(400).json({ message: "Plan invalide." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: `${process.env.FRONTEND_URL}/register?plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment?plan=${planId}&canceled=true`,
      metadata: {
        planId,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Create Public Subscription Checkout Error:", error);
    res.status(500).json({ message: "Erreur lors de la création de la session de paiement." });
  }
}
