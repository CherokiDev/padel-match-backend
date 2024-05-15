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
    origin: "https://padel-match-front-copilot-a2a6b2da36cc.herokuapp.com/",
    credentials: true,
    preflightContinue: true,
  })
);

app.use(express.json());

app.use(playerRoutes);
app.use(scheduleRoutes);

export default app;
