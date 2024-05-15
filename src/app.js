import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import playerRoutes from "./routes/player.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import cors from "cors";
import "./models/associations.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (origin === process.env.FRONTEND_HOST) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    preflightContinue: true,
  })
);
app.use(express.json());

app.use(playerRoutes);
app.use(scheduleRoutes);

export default app;
