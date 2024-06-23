import { jwtVerify } from "jose";
import { TextEncoder } from "util";
import { Player } from "../models/Player.js";
import { Schedule } from "../models/Schedule.js";

export const tokenValidationMiddleware = async (req, res, next) => {
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
      });
    } catch (err) {
      console.error("Error querying the database:", err);
      return res.sendStatus(500);
    }

    const { dataValues } = player;

    if (!dataValues) return res.sendStatus(401);

    dataValues.password = undefined;

    req.user = dataValues;

    next();
  } catch (err) {
    return res.sendStatus(401);
  }
};
