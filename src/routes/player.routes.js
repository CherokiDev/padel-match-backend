import { Router } from "express";
import {
  getPlayers,
  getPlayersWithSchedules,
  getPlayerById,
  createPlayer,
  assignSchedule,
  deletePlayer,
  getPlayersInSameSchedule,
  loginPlayer,
  getProfile,
  removeSchedule,
} from "../controllers/players.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/players", getPlayers);
router.get("/players/profile", authMiddleware, getProfile);
router.get("/players/schedules", getPlayersWithSchedules);
router.get(
  "/players/same-schedule/:id",
  authMiddleware,
  getPlayersInSameSchedule
);
router.get("/player/:id", getPlayerById);
router.post("/players", createPlayer);
router.post("/players/login", loginPlayer);
router.post("/player/:id/schedules", authMiddleware, assignSchedule);
router.delete("/player/:id/schedules", authMiddleware, removeSchedule);
router.put("/player/:id", deletePlayer);
router.get("/verify-token", authMiddleware, (req, res) => {
  res.sendStatus(200);
});

export default router;
