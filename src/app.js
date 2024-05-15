import "dotenv/config";
import dotenv from "dotenv";
import express from "express";
import playerRoutes from "./routes/player.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import "./models/associations.js";

dotenv.config();

const app = express();

// Custom CORS middleware
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://padel-match-front-copilot-a2a6b2da36cc.herokuapp.com"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,OPTIONS,POST,PUT,DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Preflight request. Reply successfully:
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

app.use(playerRoutes);
app.use(scheduleRoutes);

export default app;
