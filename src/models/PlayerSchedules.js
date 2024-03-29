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
    tableName: "playerSchedules",
    timestamps: true,
  }
);
