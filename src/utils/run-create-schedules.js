import "dotenv/config";
import { sequelize } from "../config/db.js";
import { createSchedule } from "../controllers/schedule.controller.js";

(async () => {
  await sequelize.authenticate();
  await createSchedule();
  await sequelize.close();
})();