import { Router } from "express";
import { jwtVerify, SignJWT } from "jose";
import { Player } from "../models/Player.js";
import bcrypt from "bcrypt";
import { Schedule } from "../models/Schedule.js";

const authTokenRouter = Router();

//Login con email y password
authTokenRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.sendStatus(401);

  const player = await Player.findOne({
    where: {
      email,
    },
  });

  if (!player) return res.sendStatus(401);

  const match = await bcrypt.compare(password, player.password);

  if (!match) return res.sendStatus(401);

  try {
    const { id } = player;

    const jwtConstructor = new SignJWT({ id });

    const encoder = new TextEncoder();
    const token = await jwtConstructor
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(encoder.encode(process.env.JWT_PRIVATE_KEY));

    return res.send({ token, email, id });
  } catch (err) {
    return res.sendStatus(401);
  }
});

authTokenRouter.get("/profile", async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) return res.sendStatus(401);

  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(
      authorization,
      encoder.encode(process.env.JWT_PRIVATE_KEY)
    );

    const id = payload.id;

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

    const { dataValues } = player;

    if (!dataValues) return res.sendStatus(401);

    dataValues.password = undefined;

    return res.send({ dataValues });
  } catch (err) {
    return res.sendStatus(401);
  }
});

authTokenRouter.get("/verify-token", async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization) return res.sendStatus(401);

  try {
    const encoder = new TextEncoder();
    await jwtVerify(authorization, encoder.encode(process.env.JWT_PRIVATE_KEY));

    // Si el token es válido, devolver un estado de éxito
    return res.sendStatus(200);
  } catch (err) {
    // Si el token no es válido, devolver un estado de error
    return res.sendStatus(401);
  }
});

export default authTokenRouter;
