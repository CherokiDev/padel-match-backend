import { Player } from "./Player.js";
import { PlayerSchedules } from "./PlayerSchedules.js";
import { Schedule } from "./Schedule.js";

Schedule.hasMany(PlayerSchedules, {
  foreignKey: "scheduleId",
  as: "schedulePlayerSchedules",
  onDelete: "CASCADE", // Agregar esto
});

PlayerSchedules.belongsTo(Schedule, {
  foreignKey: "scheduleId",
  onDelete: "CASCADE", // Agregar esto
});

PlayerSchedules.belongsTo(Player, {
  foreignKey: "playerId",
  onDelete: "CASCADE", // Agregar esto si también quieres eliminar en cascada cuando se elimina un Player
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
