import Sequelize from "sequelize";

export const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
    port: process.env.POSTGRES_PORT,
    logging: (msg) => {
      if (msg.includes("Error")) {
        console.error(msg);
      }
    },
  }
);
