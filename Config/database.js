
const mysql = require("mysql");
const dotenv = require('dotenv')
const envFile = "./Config/config.env";

dotenv.config({path: envFile});

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

module.exports = con;
