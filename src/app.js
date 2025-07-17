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
const allowedOrigins = [
  process.env.FRONTEND_HOST,
  process.env.FRONTEND_HOST_WWW,
  process.env.FRONTEND_HOST_PROD
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("CORS Origin:", origin);
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
