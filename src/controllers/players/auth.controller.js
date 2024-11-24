import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { Player } from "../../models/Player.js";
import { saltRounds } from "../../utils/constants.js";
import { transporter } from "../../utils/emailUtils.js";

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
    expiresIn: "7d",
  });

  res.json({ id: player.id, email: player.email, token, role: player.role });
};

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
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: "Nuevo jugador creado",
          text: `Se ha creado un nuevo jugador:\n\n Nombre: ${name}\n Email: ${email}\n Teléfono: ${phone}\n`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            console.log("Correo enviado: " + info.response);
          }
        });
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
