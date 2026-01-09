import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import emailRoutes from "./routes/emailRoutes";
import trainingRoutes from "./routes/trainingRoutes";
import exerciseRoute from "./routes/exerciceRoute";
import invitationRoutes from "./routes/invitationRoutes";
import studentRoutes from "./routes/studentRoutes";
import measurementRoutes from "./routes/measurementRoutes";
import calendarRoutes from "./routes/calendarRoutes";
import availabilityRoutes from "./routes/availabilityRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS dynamique selon l'environnement
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn(`CORS: Origin non autorisée: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposedHeaders: ["Authorization"],
    optionsSuccessStatus: 200, // Pour les anciens navigateurs
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/training-sessions", trainingRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/exercises", exerciseRoute);
app.use("/api/invitations", invitationRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/availability", availabilityRoutes);
app.get("/", (req, res) => {
  res.json({ message: "API fonctionnel" });
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});
