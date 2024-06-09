import { Sequelize, Op } from "sequelize";
import cron from "node-cron";
import moment from "moment-timezone";
import { Schedule } from "../models/Schedule.js";

const hours = ["09:00", "10:30", "12:00", "15:15", "16:45", "18:15", "19:45"];

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
  let today = moment().format("YYYY-MM-DD");

  const arrayWeek = [];
  for (let i = 0; i < 7; i++) {
    arrayWeek.push(today);
    today = moment(today).add(1, "days").format("YYYY-MM-DD");
  }

  try {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < hours.length; j++) {
        const schedule = await Schedule.create({
          dateOfReservation: moment.utc(`${arrayWeek[i]} ${hours[j]}`).toDate(),
          courtNumber: 1,
        });
        const schedule2 = await Schedule.create({
          dateOfReservation: moment.utc(`${arrayWeek[i]} ${hours[j]}`).toDate(),
          courtNumber: 2,
        });
      }
      today = moment(today).add(1, "days").format("YYYY-MM-DD");
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
        dateOfReservation: moment.utc(`${day} ${hours[j]}`).toDate(),
        courtNumber: 1,
      });
      await Schedule.create({
        dateOfReservation: moment.utc(`${day} ${hours[j]}`).toDate(),
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
