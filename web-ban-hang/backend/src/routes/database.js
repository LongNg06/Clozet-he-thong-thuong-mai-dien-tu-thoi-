require("dotenv").config({
  path: require("path").join(__dirname, "../.env")
});

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
  user: process.env.MYSQLUSER || process.env.DB_USER || "root",
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || "web_ban_hang",
  port: process.env.MYSQLPORT || 3306,
  charset: "utf8mb4"
});

db.connect((err) => {
  if (err) {
    console.error("DB ERROR:", err);
  } else {
    console.log("MySQL connected");
  }
});

module.exports = db;