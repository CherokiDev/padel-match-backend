import { Player } from "./Player.js";
import { PlayerSchedules } from "./PlayerSchedules.js";
import { Schedule } from "./Schedule.js";

Schedule.hasMany(PlayerSchedules, {
  foreignKey: "scheduleId",
  as: "schedulePlayerSchedules",
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

Player.findAll({
  include: [
    {
      model: Schedule,
      as: "schedules", // Aquí se especifica el alias
    },
  ],
});

Schedule.findAll({
  include: [
    {
      model: Player,
      as: "players", // Aquí se especifica el alias
    },
  ],
});
