import jwt from "jsonwebtoken";

export default function socketAuth(socket, next) {
  try {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) return next(new Error("unauthorized"));
    token = token.startsWith("Bearer ") ? token.slice(7) : token;
    const payload = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    socket.userId = payload.id;
    next();
  } catch (err) {
    next(new Error("unauthorized"));
  }
}
