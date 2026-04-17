require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "web_ban_hang",
  charset: "utf8mb4"
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối database:", err);
  }
});

module.exports = db;