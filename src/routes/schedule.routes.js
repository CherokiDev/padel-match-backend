import { Router } from "express";
import {
  getSchedules,
  createSchedule,
  getSchedulesAvailables,
} from "../controllers/schedule.controller.js";

const router = Router();

router.get("/schedulesAvailables", getSchedulesAvailables);
router.get("/schedules", getSchedules);
router.post("/schedules", createSchedule);
router.put("/schedule/:id");
router.delete("/schedule/:id");
router.get("/schedule/:id");

export default router;
