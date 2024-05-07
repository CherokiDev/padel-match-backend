// authMiddleware.js
import { jwtVerify } from "jose";
import { TextEncoder } from "util";
import { Player } from "../models/Player.js";
import { Schedule } from "../models/Schedule.js";

export const authMiddleware = async (req, res, next) => {
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

    req.user = dataValues; // Add this line to add the user to the req object

    next(); // Call next to move to the next middleware or route handler
  } catch (err) {
    return res.sendStatus(401);
  }
};