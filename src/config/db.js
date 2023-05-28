import Sequelize from "sequelize";

export const sequelize = new Sequelize("postgres", "admin", "admin", {
    host: "localhost",
    dialect: "postgres",
})
