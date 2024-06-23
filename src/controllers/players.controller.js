import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Player } from "../models/Player.js";
import { Schedule } from "../models/Schedule.js";
import { PlayerSchedules } from "../models/PlayerSchedules.js";
import { Op } from "sequelize";
import crypto from "crypto";
import nodemailer from "nodemailer";

const saltRounds = 10;

export const sendRegistrationDetailsEmail = async (req, res) => {
  const { email } = req.body;
  const user = await Player.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({
      message: "Error al enviar el correo electrónico de recuperación.",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "Detalles de tu cuenta",
    text: `Hola ${user.name},\n\n
      Te has registrado con éxito en nuestra plataforma. Aquí están los detalles de tu cuenta:\n\n
      Nombre: ${user.name}\n
      Correo electrónico: ${user.email}\n
      Nombre de usuario: ${user.username}\n\n
      Si tú no solicitaste esto, por favor ignora este correo.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error("Error sending email:", err);
      return res
        .status(500)
        .json({ message: "Error al enviar el correo electrónico." });
    }

    res
      .status(200)
      .json({ message: "Correo electrónico de detalles de cuenta enviado." });
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const player = await Player.findOne({ where: { email } });

  if (!player) {
    return res.status(400).json({
      message: "Error al enviar el correo electrónico de recuperación.",
    });
  }

  const token = crypto.randomBytes(20).toString("hex");
  player.resetPasswordToken = token;
  player.resetPasswordExpires = Date.now() + 3600000; // 1 hora

  await player.save();

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    to: player.email,
    from: process.env.EMAIL_USER,
    subject: "Recuperación de contraseña",
    text: `Estás recibiendo este correo porque tú (u otra persona) ha solicitado el restablecimiento de la contraseña de tu cuenta.\n\n
      Por favor, haz clic en el siguiente enlace, o pega esto en tu navegador para completar el proceso:\n\n
      ${process.env.FRONTEND_HOST}/reset/${token}\n\n
      Si tú no solicitaste esto, por favor ignora este correo y tu contraseña permanecerá sin cambios.\n`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error("Error sending email:", err);
      return res
        .status(500)
        .json({ message: "Error al enviar el correo electrónico." });
    }

    res
      .status(200)
      .json({ message: "Correo electrónico de recuperación enviado." });
  });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Validación de contraseña (al menos 8 caracteres, letras y números)
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "La contraseña debe tener al menos 8 caracteres, incluyendo letras y números",
      data: {},
    });
  }

  const player = await Player.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!player) {
    return res.status(400).json({
      message: "Token de recuperación de contraseña inválido o expirado.",
    });
  }

  player.password = await bcrypt.hash(password, saltRounds);
  player.resetPasswordToken = null;
  player.resetPasswordExpires = null;

  await player.save();

  res.status(200).json({ message: "Contraseña restablecida con éxito." });
};

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

// @desc    Create a player
// @route   POST /signup
// @access  Public
export const createPlayer = async (req, res) => {
  const { email, name, password, phone, username } = req.body;

  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Email no válido",
      data: {},
    });
  }

  // Validación de contraseña (al menos 8 caracteres, letras y números)
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "La contraseña debe tener al menos 8 caracteres, incluyendo letras y números",
      data: {},
    });
  }

  const phoneRegex = /^[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      message: "Número de teléfono no válido, debe de tener 9 dígitos",
      data: {},
    });
  }

  const existingPlayer = await Player.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  });

  if (existingPlayer) {
    let message = "Email no disponible";
    if (existingPlayer.email === email) {
      message = "Email no disponible";
    } else if (existingPlayer.username === username) {
      message = "Nombre de usuario no disponible";
    }
    return res.status(400).json({
      message,
      data: {},
    });
  } else {
    try {
      const newPlayer = await Player.create({
        email,
        name,
        password: await bcrypt.hash(password, saltRounds),
        phone,
        username,
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
  const { identifier, password } = req.body;

  let player;
  try {
    player = await Player.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }],
      },
    });
  } catch (err) {
    console.error("Error querying the database:", err);
    return res.sendStatus(500);
  }

  if (!player) {
    return res
      .status(401)
      .json({ message: "Nombre de usuario/email o contraseña incorrectos" });
  }

  const validPassword = await bcrypt.compare(password, player.password);
  if (!validPassword) {
    return res
      .status(401)
      .json({ message: "Nombre de usuario/email o contraseña incorrectos" });
  }

  const token = jwt.sign({ id: player.id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: "1h",
  });

  res.json({ id: player.id, email: player.email, token, role: player.role });
};

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
