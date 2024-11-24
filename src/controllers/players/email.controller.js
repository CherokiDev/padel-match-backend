import crypto from "crypto";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { Player } from "../../models/Player.js";
import { saltRounds } from "../../utils/constants.js";
import { transporter } from "../../utils/emailUtils.js";

export const sendRegistrationDetailsEmail = async (req, res) => {
  const { email } = req.body;
  const user = await Player.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({
      message: "Error al enviar el correo electrónico de recuperación.",
    });
  }

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
