import 'dotenv/config';
import express from "express";
import playerRoutes from "./routes/player.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import cors from './middleware/cors.js';

const app = express();

app.use(cors);
app.use(express.json());

app.use(playerRoutes);
app.use(scheduleRoutes);

export default app;