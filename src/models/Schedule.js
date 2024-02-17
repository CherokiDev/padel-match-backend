import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Schedule = sequelize.define(
  "schedules",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dateOfReservation: {
      type: DataTypes.DATE,
    },
    courtNumber: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: true,
  }
);
