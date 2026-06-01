import app from "./app.js";
import { sequelize } from "./config/db.js";
import { Player } from "./models/Player.js";
import { PlayerSchedules } from "./models/PlayerSchedules.js";
import { Schedule } from "./models/Schedule.js";
import { Message } from "./models/Message.js";
import logger from "./utils/logger.js";
import { createSchedule } from "./controllers/schedule.controller.js";
import http from "http";
import { setupSocket } from "./socket.js";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await sequelize.authenticate();
    logger.info("Connection has been established successfully.");

    // // Forzar la sincronización de los modelos, esto eliminará y recreará las tablas
    // await Player.sync({ force: true });
    // await Schedule.sync({ force: true });
    // await PlayerSchedules.sync({ force: true });
    // await Message.sync({ force: true });

    // // Vaciar las tablas
    // if (process.env.NODE_ENV !== "production") {
    //   await Player.truncate({ cascade: true });
    //   await Schedule.truncate({ cascade: true });
    //   await PlayerSchedules.truncate({ cascade: true });
    //   await Message.truncate({ cascade: true });
    // }

    const server = http.createServer(app);

    // Allow CORS for Socket.IO
    const socketAllowedOrigins = [
      process.env.FRONTEND_HOST,
      process.env.FRONTEND_HOST_WWW,
      process.env.FRONTEND_HOST_PROD,
    ].filter(Boolean);
    if (process.env.NODE_ENV !== "production") {
      socketAllowedOrigins.push("http://localhost:5173");
    }

    setupSocket(server, socketAllowedOrigins);

    if (process.env.NODE_ENV === "production") {
      logger.info("Running in production mode");
    } else {
      logger.info("Running in development mode");
    }

    // // Llama a createSchedule si no hay registros en la tabla Schedule
    // const count = await Schedule.count();
    // if (count === 0) {
    //   await createSchedule({ body: {} }, { json: () => {}, status: () => ({ json: () => {} }) });
    // }

    // IMPORTANT: listen on the HTTP server that Socket.IO is attached to
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Unable to connect to the database:", error);
  }
}

main();