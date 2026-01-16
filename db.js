const mysql = require('mysql');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.SQL_SECRET,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

module.exports = db;