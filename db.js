const mysql = require('mysql');
const querystring = require('querystring');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.SQL_SECRET,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}


module.exports = query;