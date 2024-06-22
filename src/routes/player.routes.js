import { Router } from "express";
import {
  getPlayers,
  createPlayer,
  assignSchedule,
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

// Players
router
  .route("/players")
  .get(
    tokenValidationMiddleware,
    roleValidationMiddleware(["admin"]),
    getPlayers
  )
  .post(createPlayer);

router
  .post("/players/login", loginPlayer)
  .get("/players/profile", tokenValidationMiddleware, getProfile);

// Player schedules
router
  .route("/players/:id/schedules")
  .post(tokenValidationMiddleware, assignSchedule)
  .delete(tokenValidationMiddleware, removeSchedule);

router.get(
  "/players/same-schedule/:id",
  tokenValidationMiddleware,
  getPlayersInSameSchedule
);

// Password management
router.post("/players/forgot", forgotPassword);
router.post("/players/reset/:token", resetPassword);

// Registration
router.post("/send-registration-details-email", sendRegistrationDetailsEmail);

// Token verification
router.get("/verify-token", tokenValidationMiddleware, (req, res) => {
  res.sendStatus(200);
});

// router.get("/players/schedules", getPlayersWithSchedules);

// router.get("/players/:id", getPlayerById);

// router.put("/players/:id", deletePlayer);

export default router;
