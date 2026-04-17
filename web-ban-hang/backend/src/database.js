// const mysql = require("mysql2");

// const db = mysql.createConnection({
//   host: process.env.MYSQLHOST || process.env.DB_HOST,
//   user: process.env.MYSQLUSER || process.env.DB_USER,
//   password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
//   database: process.env.MYSQLDATABASE || process.env.DB_NAME,
//   port: process.env.MYSQLPORT || 3306,
//   charset: "utf8mb4"
// });

// db.connect((err) => {
//   if (err) {
//     console.error("DB connection error:", err);
//   } else {
//     console.log("MySQL connected");
//   }
// });

// module.exports = db;
const mysql = require("mysql2");

console.log("ENV CHECK:");
console.log("MYSQLHOST =", process.env.MYSQLHOST);
console.log("MYSQLUSER =", process.env.MYSQLUSER);
console.log("MYSQLDATABASE =", process.env.MYSQLDATABASE);

const db = mysql.createConnection({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port: process.env.MYSQLPORT || 3306,
  charset: "utf8mb4"
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connect error:", err);
  } else {
    console.log("✅ MySQL connected");
  }
});

module.exports = db;