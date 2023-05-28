import express from "express";
import playerRoutes from "./routes/player.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";

const app = express();

app.use(express.json());

app.use(playerRoutes);
app.use(scheduleRoutes);

export default app;