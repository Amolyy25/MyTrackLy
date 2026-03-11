import express, { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { 
  createCheckoutSession, 
  handleStripeWebhook, 
  verifySession,
  createConnectAccount,
  createAccountLink,
  createLoginLink,
  handleStripeConnectWebhook,
  syncAccountStatus,
  getEarnings,
  getRevenueStats,
  createSubscriptionCheckout,
  createPublicSubscriptionCheckout,
  verifySubscriptionSession,
  createPublicCheckoutRedirect
} from "../controllers/stripeController";

const router = Router();

// Webhook Stripe (doit avoir le body brut)
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
router.post("/webhook-connect", express.raw({ type: "application/json" }), handleStripeConnectWebhook);

// Autres routes utilisent JSON
router.use(express.json());

router.post("/create-checkout-session", authenticateToken, createCheckoutSession);
router.post("/create-subscription-checkout", authenticateToken, createSubscriptionCheckout);
router.post("/public-subscription-checkout", createPublicSubscriptionCheckout);
router.get("/public/pay/:reservationId", createPublicCheckoutRedirect);
router.get("/verify-session", authenticateToken, verifySession);
router.get("/verify-subscription-session", authenticateToken, verifySubscriptionSession);

// Flux Stripe Connect
router.post("/connect/create-account", authenticateToken, createConnectAccount);
router.post("/connect/create-account-link", authenticateToken, createAccountLink);
router.post("/connect/create-login-link", authenticateToken, createLoginLink);
router.get("/connect/sync-status", authenticateToken, syncAccountStatus);
router.get("/earnings", authenticateToken, getEarnings);
router.get("/revenue-stats", authenticateToken, getRevenueStats);

export default router;
