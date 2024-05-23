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
  forgotPassword,
  resetPassword,
  sendRegistrationDetailsEmail,
} from "../controllers/players.controller.js";
import { tokenValidationMiddleware } from "../middleware/tokenValidationMiddleware.js";
import { roleValidationMiddleware } from "../middleware/roleValidationMiddleware.js";

const router = Router();

router.get(
  "/players",
  tokenValidationMiddleware,
  roleValidationMiddleware(["admin"]),
  getPlayers
);
router.get("/players/profile", tokenValidationMiddleware, getProfile);
router.get("/players/schedules", getPlayersWithSchedules);
router.get(
  "/players/same-schedule/:id",
  tokenValidationMiddleware,
  getPlayersInSameSchedule
);
router.get("/player/:id", getPlayerById);
router.post("/players", createPlayer);
router.post("/players/login", loginPlayer);
router.post("/player/:id/schedules", tokenValidationMiddleware, assignSchedule);
router.delete(
  "/player/:id/schedules",
  tokenValidationMiddleware,
  removeSchedule
);
router.put("/player/:id", deletePlayer);
router.get("/verify-token", tokenValidationMiddleware, (req, res) => {
  res.sendStatus(200);
});
router.post("/players/forgot", forgotPassword);
router.post("/players/reset/:token", resetPassword);
router.post("/send-registration-details-email", sendRegistrationDetailsEmail);

export default router;
