const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "web_ban_hang"
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối database:", err);
  }
});

module.exports = db;