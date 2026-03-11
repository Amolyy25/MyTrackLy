import dotenv from "dotenv";
dotenv.config();

console.log("PERSONNEL_PRICE:", process.env.STRIPE_PRICE_ID_PERSONNEL);
console.log("COACH_PRICE:", process.env.STRIPE_PRICE_ID_COACH);
