import { Player } from "../models/Player.js";
import { Schedule } from "../models/Schedule.js";
import { PlayerSchedules } from "../models/PlayerSchedules.js";
import bcrypt from "bcrypt";

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

// export const getPlayers = async (req, res) => {
//   // en el json, no mostrar el campo isActive
//   try {
//     const players = await Player.findAll({
//       attributes: {
//         exclude: ['isActive'],
//       },
//     });
//     res.json({
//       data: players,
//     });
//   }
//   catch (error) {
//     console.log(error);
//   }
// };

// @desc    Get all players with schedules
// @route   GET /players/schedules
// @access  Public

export const getPlayersWithSchedules = async (req, res) => {
  try {
    const players = await Player.findAll({
      include: {
        model: Schedule,
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

// @desc    Get player by id
// @route   GET /player/:id
// @access  Private

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
// @route   POST /players
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
      message: "Ya existe un jugador con ese email",
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

// export const loginPlayer = async (req, res) => {

//   res.send({
//     token: 'test123'
//   });

// };

// export const loginPlayer = async (email, password) => {

//   const player = Player.findOne({
//     where: {
//       email,
//     },
//   });

//   if (!player) return null;

//   if (player.password !== password) return null;

//   return player;

// };

// @desc    Assign a schedule to a player
// @route   POST /player/:id/schedules
// @access  Public

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
      player.addSchedule(schedule, { through: { payer } });
      return res.status(201).json({
        message: "Schedule assigned to player",
        data: player,
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
      player.save();
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
