import { Sequelize, Op } from "sequelize";
import cron from "node-cron";
import moment from "moment/moment.js";
import { PlayerSchedules } from "../models/PlayerSchedules.js";
import { Schedule } from "../models/Schedule.js";

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

  const hours = [
    "10:00",
    "11:30",
    "13:00",
    "14:30",
    "16:00",
    "17:30",
    "19:00",
    "20:30",
  ];

  try {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < hours.length; j++) {
        const schedule = await Schedule.create({
          dateOfReservation: `${arrayWeek[i]} ${hours[j]}`,
          courtNumber: 1,
        });
        const schedule2 = await Schedule.create({
          dateOfReservation: `${arrayWeek[i]} ${hours[j]}`,
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
  }
};

export const updateSchedules = async () => {
  try {
    // Eliminar los Schedule del día más antiguo
    await Schedule.destroy({
      where: {
        dateOfReservation: {
          [Op.lt]: moment().startOf("day").toDate(),
        },
      },
    });

    // Crear los nuevos Schedule para cada uno de los próximos 7 días
    const hours = [
      "10:00",
      "11:30",
      "13:00",
      "14:30",
      "16:00",
      "17:30",
      "19:00",
      "20:30",
    ];
    for (let i = 0; i < 7; i++) {
      let day = moment().add(i, "days").format("YYYY-MM-DD");
      for (let j = 0; j < hours.length; j++) {
        await Schedule.create({
          dateOfReservation: `${day} ${hours[j]}`,
          courtNumber: 1,
        });
        await Schedule.create({
          dateOfReservation: `${day} ${hours[j]}`,
          courtNumber: 2,
        });
        // await Schedule.destroy({
        //   where: {
        //     dateOfReservation: {
        //       [Op.gte]: moment().startOf("day").toDate(),
        //       [Op.lt]: moment().add(1, "day").startOf("day").toDate(),
        //     },
        //   },
        // });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

cron.schedule("0 0 * * *", updateSchedules);

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
