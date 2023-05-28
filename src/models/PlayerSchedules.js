import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'
import { Player } from './player.js'
import { Schedule } from './Schedule.js'

export const PlayerSchedules = sequelize.define('playerSchedules', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    payer: {
        type: DataTypes.BOOLEAN,
    },
}, {
    timestamps: true
})

Player.belongsToMany(Schedule, {
    through: PlayerSchedules,
})

Schedule.belongsToMany(Player, {
    through: PlayerSchedules,
})

// await Player.sync()
// await Schedule.sync()
// await PlayerSchedules.sync()