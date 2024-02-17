import "dotenv/config";
import express from "express";
import playerRoutes from "./routes/player.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import cors from "cors";
import authTokenRouter from "./middleware/auth.js";
import "./models/associations.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

// app.use(authTokenRouter)
app.use(playerRoutes);
app.use(scheduleRoutes);

export default app;
