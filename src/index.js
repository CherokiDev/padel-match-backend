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

    await Player.sync();
    await Schedule.sync();
    await PlayerSchedules.sync();

    // Vaciar las tablas
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

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

main();
