const mysql = require("mysql2");

const db = mysql.createPool({
  host:     "localhost",
  user:     "root",
  password: "",
  database: "gift-city",
}).promise();  // .promise() lets us use async/await in routes

module.exports = db;