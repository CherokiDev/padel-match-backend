import { Player } from "./Player.js";
import { PlayerSchedules } from "./PlayerSchedules.js";
import { Schedule } from "./Schedule.js";

Schedule.hasMany(PlayerSchedules, {
  foreignKey: "scheduleId",
  as: "schedulePlayerSchedules", // changed alias to be unique
});

PlayerSchedules.belongsTo(Schedule, {
  foreignKey: "scheduleId",
});

PlayerSchedules.belongsTo(Player, {
  foreignKey: "playerId",
});

Player.belongsToMany(Schedule, {
  through: PlayerSchedules,
  foreignKey: "playerId",
  otherKey: "scheduleId",
  as: "schedules",
});

Schedule.belongsToMany(Player, {
  through: PlayerSchedules,
  foreignKey: "scheduleId",
  otherKey: "playerId",
  as: "players",
});
