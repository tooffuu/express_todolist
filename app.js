import express from "express";
import mysql from "mysql2/promise";
const app = express();
const port = 3000;

const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "a9",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/todos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM todo ORDER BY id DESC");
  console.log("rows", rows);

  res.json(rows);
});

app.get("/", (req, res) => {
  res.send("Hello World"); // res.send 에 인자는 문자로 들어가야 함, 숫자 x
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
