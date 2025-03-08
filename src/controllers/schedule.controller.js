import { Sequelize, Op } from "sequelize";
import cron from "node-cron";
import moment from "moment-timezone";
import { Schedule } from "../models/Schedule.js";

const hours = [
  "09:00",
  "10:30",
  "12:00",
  "15:15",
  "16:45",
  "18:15",
  "19:45",
].map((hour) => {
  const [hours, minutes] = hour.split(":");
  return new Date(1970, 0, 1, hours, minutes);
});

moment.tz.setDefault("Europe/Madrid");

export const getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll();
    res.json({
      data: schedules,
    });
  } catch (error) {
    console.log(error);
  }
};

export const createSchedule = async (req, res) => {
  try {
    const count = await Schedule.count();
    if (count > 0) {
      return res.status(400).json({ message: "Schedules already exist" });
    }

    let today = moment().format("YYYY-MM-DD");

    const arrayWeek = [];
    for (let i = 0; i < 7; i++) {
      arrayWeek.push(today);
      today = moment(today).add(1, "days").format("YYYY-MM-DD");
    }

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < hours.length; j++) {
        const dateOfReservation = moment(`${arrayWeek[i]} ${hours[j].toTimeString().slice(0, 5)}`, "YYYY-MM-DD HH:mm").toDate();
        await Schedule.create({
          dateOfReservation,
          courtNumber: 1,
        });
        await Schedule.create({
          dateOfReservation,
          courtNumber: 2,
        });
      }
    }
    res.json({
      message: "Schedule created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating schedule" });
  }
};

export const updateSchedules = async () => {
  try {
    await Schedule.destroy({
      where: {
        dateOfReservation: {
          [Op.lt]: moment().startOf("day").toDate(),
        },
      },
    });

    let day = moment().add(7, "days").format("YYYY-MM-DD");
    for (let j = 0; j < hours.length; j++) {
      await Schedule.create({
        dateOfReservation: moment(day)
          .set({ hour: hours[j].getHours(), minute: hours[j].getMinutes() })
          .toDate(),
        courtNumber: 1,
      });
      await Schedule.create({
        dateOfReservation: moment(day)
          .set({ hour: hours[j].getHours(), minute: hours[j].getMinutes() })
          .toDate(),
        courtNumber: 2,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

cron.schedule("0 2 * * *", updateSchedules, {
  scheduled: true,
  timezone: "Europe/Madrid",
});

export const deleteSchedule = async (req, res) => {
  const { id } = res.body;
  try {
    const schedule = await Schedule.destroy({
      where: {
        id,
      },
    });
    res.json({
      message: "Schedule deleted successfully",
      count: schedule,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getSchedulesAvailables = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      where: {
        id: {
          [Op.notIn]: Sequelize.literal(
            `(SELECT "scheduleId" FROM "playerSchedules" WHERE payer = true)`
          ),
        },
      },
      order: [["id", "ASC"]],
    });
    res.json({
      data: schedules,
    });
  } catch (error) {
    console.log(error);
  }
};
