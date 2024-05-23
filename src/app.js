import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import playerRoutes from "./routes/player.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import "./models/associations.js";

dotenv.config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.FRONTEND_HOST, // o puedes usar un array de strings para permitir múltiples dominios
  methods: "GET,HEAD,OPTIONS,POST,PUT,DELETE",
  allowedHeaders:
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  credentials: true, // permite cookies
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(playerRoutes);
app.use(scheduleRoutes);

export default app;
