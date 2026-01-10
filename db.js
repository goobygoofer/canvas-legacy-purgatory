const mysql = require('mysql');
require('dotenv').config();
/*
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  charset: 'utf8mb4'
});
*/

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.SQL_SECRET,
  database: 'draw_battle',
  connectionLimit: 10,
  charset: 'utf8mb4'
});

module.exports = db;