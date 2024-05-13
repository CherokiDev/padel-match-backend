import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Player } from "../models/Player.js";
import { Schedule } from "../models/Schedule.js";
import { PlayerSchedules } from "../models/PlayerSchedules.js";

const saltRounds = 10;

// @desc    Get all players
// @route   GET /players
// @access  Public
export const getPlayers = async (req, res) => {
  try {
    const players = await Player.findAll({
      where: {
        isActive: true,
      },
      attributes: {
        exclude: ["isActive", "password"],
      },
    });

    res.json({
      data: players,
    });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Get all players with schedules
// @route   GET /players/schedules
// @access  Public
export const getPlayersWithSchedules = async (req, res) => {
  try {
    const players = await Player.findAll({
      include: {
        model: Schedule,
        as: "schedules",
      },
      where: {
        isActive: true,
      },
      attributes: {
        exclude: ["isActive", "password"],
      },
    });
    res.json({
      data: players,
    });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Get player by Id
// @route   GET /player/:id
// @access  Public
export const getPlayerById = async (req, res) => {
  console.log(req);
  const { id } = req.params;
  try {
    const player = await Player.findOne({
      where: {
        id,
      },
      include: {
        model: Schedule,
        as: "schedules",
      },
    });
    res.json({
      data: player,
    });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Create a player
// @route   POST /signup
// @access  Public
export const createPlayer = async (req, res) => {
  const { email, name, password, phone, apodo } = req.body;
  const player = await Player.findOne({
    where: {
      email,
    },
  });

  if (player) {
    return res.status(400).json({
      message: "Email no disponible",
      data: {},
    });
  } else {
    try {
      const newPlayer = await Player.create({
        email,
        name,
        password: await bcrypt.hash(password, saltRounds),
        phone,
        apodo,
      });
      if (newPlayer) {
        return res.status(201).json({
          message: "Jugador creado correctamente",
          data: newPlayer,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Algo salió mal",
        data: {},
      });
    }
  }
};

// @desc    Login a player
// @route   POST /login
// @access  Public
export const loginPlayer = async (req, res) => {
  const { email, password } = req.body;

  let player;
  try {
    player = await Player.findOne({
      where: {
        email: email,
      },
    });
  } catch (err) {
    console.error("Error querying the database:", err);
    return res.sendStatus(500); // Internal Server Error
  }

  if (!player) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const validPassword = await bcrypt.compare(password, player.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: player.id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: "1h",
  });

  res.json({ id: player.id, email: player.email, token, role: player.role });
};

// @desc    Assign a schedule to a player
// @route   POST /player/:id/schedules
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
        message: "There is already a payer for this schedule",
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
        message: "Player already has this schedule",
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
        message: "Schedule assigned to player",
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
// @route   DELETE /player/:id/schedules
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
      message: "Schedule removed from player",
    });
  } catch (error) {
    console.log(error);
  }
};

// @desc    Delete a player
// @route   PUT /player/:id
// @access  Public
export const deletePlayer = async (req, res) => {
  const { id } = req.params;

  try {
    const player = await Player.findOne({
      where: {
        id,
      },
    });

    if (player && player.isActive === false) {
      return res.status(400).json({
        message: "Player already deleted",
      });
    }

    if (player) {
      player.isActive = false;
      const timestamp = Date.now();
      player.email = "del_" + player.email + "_" + timestamp;
      await player.save();
      await PlayerSchedules.destroy({
        where: {
          playerId: id,
        },
      });
    }

    res.json({
      message: "Player deleted",
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

// @desc    Get player profile
// @route   GET /players/profile
// @access  Private
export const getProfile = async (req, res) => {
  const id = req.user.id;

  let player;
  try {
    player = await Player.findOne({
      where: {
        id: id,
      },
      include: {
        model: Schedule,
        as: "schedules",
      },
    });
  } catch (err) {
    console.error("Error querying the database:", err);
    return res.sendStatus(500); // Internal Server Error
  }

  if (!player) return res.sendStatus(404); // Not Found

  const { dataValues } = player;

  dataValues.password = undefined;

  return res.send({ dataValues });
};
