import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY missing");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

async function main() {
  console.log("Creating products and prices...");
  
  const personnelProduct = await stripe.products.create({
    name: "Abonnement Personnel",
    description: "L'essentiel pour progresser seul."
  });
  
  const personnelPrice = await stripe.prices.create({
    product: personnelProduct.id,
    unit_amount: 500, // 5 euros
    currency: "eur",
    recurring: { interval: "month" },
  });

  const coachProduct = await stripe.products.create({
    name: "Abonnement Coach Pro",
    description: "Pour les coachs qui veulent scaler."
  });
  
  const coachPrice = await stripe.prices.create({
    product: coachProduct.id,
    unit_amount: 5000, // 50 euros
    currency: "eur",
    recurring: { interval: "month" },
  });

  console.log(`STRIPE_PRICE_ID_PERSONNEL=${personnelPrice.id}`);
  console.log(`STRIPE_PRICE_ID_COACH=${coachPrice.id}`);
}

main().catch(console.error);
