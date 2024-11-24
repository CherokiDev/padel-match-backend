import { Player } from "../../models/Player.js";
import { Schedule } from "../../models/Schedule.js";

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
// @route   GET /players/:id
// @access  Public
export const getPlayerById = async (req, res) => {
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

// @desc    Delete a player
// @route   PUT /players/:id
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
