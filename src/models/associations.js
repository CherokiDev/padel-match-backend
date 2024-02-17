// En tu archivo associations.js
import { Player } from "./Player.js";
import { PlayerSchedules } from "./PlayerSchedules.js";
import { Schedule } from "./Schedule.js";

Schedule.hasMany(PlayerSchedules, {
  foreignKey: "scheduleId",
  as: "playerSchedules",
});

PlayerSchedules.belongsTo(Schedule, {
  foreignKey: "scheduleId",
});

PlayerSchedules.belongsTo(Player, {
  foreignKey: "playerId",
});
