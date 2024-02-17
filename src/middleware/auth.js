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
    const jwt = await jwtConstructor
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(encoder.encode(process.env.JWT_PRIVATE_KEY));

    console.log(jwt);
    return res.send({ jwt, email, id });
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

    const player = await Player.findOne({
      where: {
        id: id,
      },
      include: {
        model: Schedule,
      },
    });

    const { dataValues } = player;

    if (!dataValues) return res.sendStatus(401);

    dataValues.password = undefined;

    return res.send({ dataValues });
  } catch (err) {
    return res.sendStatus(401);
  }
});

export default authTokenRouter;
