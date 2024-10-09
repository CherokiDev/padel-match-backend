import app from "./app.js";
import { sequelize } from "./config/db.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");

    // Check the value of NODE_ENV
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
