import app from "./app.js";
import { sequelize } from "./config/db.js";

import "./models/Player.js";
import "./models/Schedule.js";
import "./models/PlayerSchedules.js";

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync({ force: false });
    app.listen(process.env.PORT || 3000);
    console.log("Server on port 3000");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

main();
