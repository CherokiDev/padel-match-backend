import { Player } from "../../models/Player.js";
import { Schedule } from "../../models/Schedule.js";
import { PlayerSchedules } from "../../models/PlayerSchedules.js";
import { Op } from "sequelize";

// @desc    Assign a schedule to a player
// @route   POST /players/:id/schedules
// @access  Private
export const assignSchedule = async (req, res) => {
  const { id } = req.params;
  const { scheduleId, payer } = req.body;

  try {
    const player = await Player.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["isActive", "password"],
      },
    });

    const schedule = await Schedule.findOne({
      where: {
        id: scheduleId,
      },
    });

    const payerSchedule = await PlayerSchedules.findOne({
      where: {
        scheduleId,
        payer: true,
      },
    });

    if (payerSchedule && payer) {
      return res.status(400).json({
        message: "Este horario ya está reservado por otro jugador",
      });
    }

    const playerSchedule = await Player.findOne({
      where: {
        id,
      },
      include: {
        model: Schedule,
        as: "schedules",
        where: {
          id: scheduleId,
        },
      },
    });

    if (playerSchedule) {
      return res.status(400).json({
        message: "Ya tienes este horario asignado",
      });
    }

    if (player && schedule) {
      await player.addSchedule(schedule, { through: { payer } });

      const updatedPlayer = await Player.findOne({
        where: {
          id,
        },
        attributes: {
          exclude: ["isActive", "password"],
        },
        include: {
          model: Schedule,
          as: "schedules",
        },
      });

      return res.status(201).json({
        message: "Horario asignado correctamente",
        data: updatedPlayer,
      });
    }

    return res.status(404).json({
      message: "Player or schedule not found",
      data: {},
    });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Remove a schedule from a player
// @route   DELETE /players/:id/schedules
// @access  Private
export const removeSchedule = async (req, res) => {
  const { id } = req.params;
  const { scheduleId } = req.body;

  try {
    const player = await Player.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["isActive", "password"],
      },
    });

    const schedule = await Schedule.findOne({
      where: {
        id: scheduleId,
      },
    });

    if (!player || !schedule) {
      return res.status(404).json({
        message: "Player or schedule not found",
        data: {},
      });
    }

    const playerSchedule = await Player.findOne({
      where: {
        id,
      },
      include: {
        model: Schedule,
        as: "schedules",
        where: {
          id: scheduleId,
        },
      },
    });

    if (!playerSchedule) {
      return res.status(400).json({
        message: "Player does not have this schedule",
      });
    }

    await player.removeSchedule(schedule);

    return res.status(200).json({
      message: "Horario eliminado correctamente",
    });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Get players in the same schedule
// @route   GET /playersinsameschedule/:id
// @access  Private
export const getPlayersInSameSchedule = async (req, res) => {
  try {
    const playerId = req.params.id;
    const userId = req.user.id;

    if (String(playerId) !== String(userId)) {
      return res.status(403).json({
        message: "You are not authorized to access this route",
      });
    }

    const payerSchedules = await PlayerSchedules.findAll({
      where: { playerId: playerId, payer: true },
    });
    const payerScheduleIds = payerSchedules.map((ps) => ps.scheduleId);
    const playerSchedules = await PlayerSchedules.findAll({
      where: { scheduleId: payerScheduleIds },
    });
    const playerIds = playerSchedules.map((ps) => ps.playerId);
    let players = await Player.findAll({
      where: { id: playerIds },
      include: [
        {
          model: Schedule,
          as: "schedules",
          required: false, // This is important
        },
      ],
    });

    // Filter schedules for each player
    players = players.map((player) => {
      const filteredSchedules = player.schedules.filter((schedule) =>
        payerScheduleIds.includes(schedule.id)
      );
      return { ...player.toJSON(), schedules: filteredSchedules };
    });

    // Exclude the player that matches the playerId parameter
    players = players.filter((player) => player.id.toString() !== playerId);

    res.json({
      message: "Players in the same schedule",
      players: players,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error getting players in the same schedule",
    });
  }
};
