import { Player } from "./Player.js";
import { PlayerSchedules } from "./PlayerSchedules.js";
import { Schedule } from "./Schedule.js";
import { Message } from "./Message.js";

Schedule.hasMany(PlayerSchedules, {
  foreignKey: "scheduleId",
  as: "schedulePlayerSchedules",
  onDelete: "CASCADE",
});

PlayerSchedules.belongsTo(Schedule, {
  foreignKey: "scheduleId",
  onDelete: "CASCADE",
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

// Message Associations
Message.belongsTo(  Player, {
  foreignKey: "senderId",
  onDelete: "CASCADE",
  as: "sender",
});

Message.belongsTo(  Player, {
  foreignKey: "receiverId",
  onDelete: "CASCADE",
  as: "receiver",
});

Message.belongsTo(  Schedule, {
  foreignKey: "scheduleId",
  onDelete: "SET NULL",
  as: "schedule",
});

Player.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages",
  onDelete: "CASCADE",
});

Player.hasMany(Message, {
  foreignKey: "receiverId",
  as: "receivedMessages",
  onDelete: "CASCADE",
});