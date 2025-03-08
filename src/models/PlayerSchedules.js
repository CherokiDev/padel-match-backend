import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const PlayerSchedules = sequelize.define(
  "playerSchedules",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    payer: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    schema: process.env.POSTGRES_SCHEMA,
    tableName: "playerSchedules",
    timestamps: true,
  }
);
