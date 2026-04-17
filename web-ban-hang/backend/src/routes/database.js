const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  charset: "utf8mb4"
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối database:", err);
  } else {
    console.log("MySQL connected");
  }
});

module.exports = db;