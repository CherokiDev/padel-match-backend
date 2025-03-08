import app from "./app.js";
import { sequelize } from "./config/db.js";
import { Player } from "./models/Player.js";
import { PlayerSchedules } from "./models/PlayerSchedules.js";
import { Schedule } from "./models/Schedule.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");

    // // Forzar la sincronización de los modelos, esto eliminará y recreará las tablas
    // await Player.sync({ force: true });
    // await Schedule.sync({ force: true });
    // await PlayerSchedules.sync({ force: true });

    // // Vaciar las tablas
    // if (process.env.NODE_ENV !== "production") {
    //   await Player.truncate({ cascade: true });
    //   await Schedule.truncate({ cascade: true });
    //   await PlayerSchedules.truncate({ cascade: true });
    // }

    if (process.env.NODE_ENV === "production") {
      logger.info("Running in production mode");
    } else {
      logger.info("Running in development mode");
    }

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
}

main();
