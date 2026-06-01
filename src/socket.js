import { Server } from "socket.io";
import { Message } from "./models/Message.js";
import logger from "./utils/logger.js";
import socketAuth from "./middleware/socketAuth.js";

export function setupSocket(server, allowedOrigins) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    logger.info(`Socket connected userId=${socket.userId} socketId=${socket.id}`);
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);

    socket.on("message:send", async ({ toUserId, content, scheduleId }) => {
      try {
        if (!toUserId || !content?.trim()) return;
        const msg = await Message.create({
          senderId: socket.userId,
          receiverId: toUserId,
          scheduleId: scheduleId ?? null,
          content: content.trim(),
        });
        logger.info(`message:send payload sender=${socket.userId} to=${toUserId} schedule=${scheduleId}`);
        io.to(`user:${toUserId}`).emit("message:new", msg);
        io.to(`user:${socket.userId}`).emit("message:new", msg);
      } catch (err) {
        logger.error(`message:send error: ${err.message}`);
      }
    });

    socket.on("message:markRead", async ({ fromUserId }) => {
      try {
        await Message.update(
          { isRead: true, readAt: new Date() },
          { where: { receiverId: socket.userId, senderId: fromUserId, isRead: false } }
        );
      } catch (err) {
        logger.error(`message:markRead error: ${err.message}`);
      }
    });

    socket.on("disconnect", () => {
      logger.info(`Socket disconnected userId=${socket.userId} socketId=${socket.id}`);
    });
  });

  return io;
}
