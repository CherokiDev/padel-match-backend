import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

export const Player = sequelize.define('players', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    apodo: {
        type: DataTypes.STRING,
    }
}, {
    timestamps: true
})
