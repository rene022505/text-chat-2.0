
const dotenv = require('dotenv')
const envFile = "./Config/config.env";
const { Sequelize } = require('sequelize');

dotenv.config({path: envFile});

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

module.exports = con;
