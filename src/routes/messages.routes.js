import { Router } from "express";
import { tokenValidationMiddleware } from "../middleware/tokenValidationMiddleware.js";
import { Message } from "../models/Message.js";
import { Player } from "../models/Player.js";
import { Schedule } from "../models/Schedule.js";
import { Op } from "sequelize";

const router = Router();

router.get("/messages/with/:userId", tokenValidationMiddleware, async (req, res) => {
  const me = req.user.id;
  const other = parseInt(req.params.userId, 10);
  const scheduleId = req.query.scheduleId ? parseInt(req.query.scheduleId, 10) : null;

  const where = {
    [Op.or]: [
      { senderId: me, receiverId: other },
      { senderId: other, receiverId: me },
    ],
  };
  if (scheduleId) {
    where.scheduleId = scheduleId;
  }

  const messages = await Message.findAll({
    where,
    order: [["createdAt", "ASC"]],
  });

  res.json({ data: messages });
});

// Returns one entry per (peer, schedule) with last message preview and unread count.
router.get("/messages/conversations", tokenValidationMiddleware, async (req, res) => {
  const me = req.user.id;

  const messages = await Message.findAll({
    where: {
      [Op.or]: [{ senderId: me }, { receiverId: me }],
      scheduleId: { [Op.ne]: null },
    },
    order: [["createdAt", "DESC"]],
    include: [
      { model: Player, as: "sender", attributes: ["id", "username", "name"] },
      { model: Player, as: "receiver", attributes: ["id", "username", "name"] },
      { model: Schedule, as: "schedule", attributes: ["id", "dateOfReservation", "courtNumber"] },
    ],
  });

  const grouped = {};
  for (const msg of messages) {
    const otherId = msg.senderId === me ? msg.receiverId : msg.senderId;
    const key = `${otherId}-${msg.scheduleId}`;
    if (!grouped[key]) {
      grouped[key] = {
        peer: msg.senderId === me ? msg.receiver : msg.sender,
        schedule: msg.schedule,
        msgs: [],
      };
    }
    grouped[key].msgs.push(msg);
  }

  const conversations = Object.values(grouped).map(({ peer, schedule, msgs }) => ({
    peer,
    schedule,
    lastMessage: {
      content: msgs[0].content,
      createdAt: msgs[0].createdAt,
      senderId: msgs[0].senderId,
    },
    unreadCount: msgs.filter((m) => m.receiverId === me && !m.isRead).length,
  }));

  conversations.sort(
    (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
  );

  res.json({ data: conversations });
});

// Returns the scheduleIds where the current user has received at least one message.
// Used by non-payers to know if the payer has admitted them to a conversation.
router.get("/messages/admitted-schedules", tokenValidationMiddleware, async (req, res) => {
  const me = req.user.id;
  const messages = await Message.findAll({
    where: {
      receiverId: me,
      scheduleId: { [Op.ne]: null },
    },
    attributes: ["scheduleId"],
    group: ["scheduleId"],
    raw: true,
  });
  res.json({ data: messages.map((m) => m.scheduleId) });
});

export default router;