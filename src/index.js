import app from "./app.js";
import { sequelize } from "./config/db.js";

import { Player } from "./models/Player.js";
import { Schedule } from "./models/Schedule.js";
import { PlayerSchedules } from "./models/PlayerSchedules.js";

const PORT = process.env.PORT || 3000;

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

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

    const players = await Player.findAll({
      include: [
        {
          model: Schedule,
          as: "schedules",
        },
      ],
    });

    const schedules = await Schedule.findAll({
      include: [
        {
          model: Player,
          as: "players",
        },
      ],
    });

    // Check the value of NODE_ENV
    if (process.env.NODE_ENV === "production") {
      console.log("Running in production mode");
    } else {
      console.log("Running in development mode");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

main();
