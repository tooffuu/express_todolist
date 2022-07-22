import express from "express";
import mysql from "mysql2/promise";
import axios from "axios";

const app = express();
app.use(express.json());

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

app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.query(
    `
    SELECT *
    FROM todo
    WHERE id = ?
  `,
    [id]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  res.json(rows[0]);
});

app.patch("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { perform_date, content } = req.body;

  const [rows] = await pool.query(
    `
      SELECT *
      FROM todo
      WHERE id = ?
      `,
    [id]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
  }

  if (!perform_date) {
    res.status(400).json({
      msg: "perform_date required",
    });
    return;
  }

  if (!content) {
    res.status(400).json({
      msg: "content required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
      UPDATE todo
      SET perform_date =?, content = ?
      WHERE id = ?
    `,
    [perform_date, content, id]
  );

  res.json({
    msg: `${id}번 할 일이 수정되었습니다.`,
  });
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const [[todoRow]] = await pool.query(
    `
    SELECT * FROM todo
    WHERE id = ?
    `,
    [id]
  );

  if (todoRow === undefined) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    DELETE FROM todo
    WHERE id = ?
    `,
    [id]
  );

  res.json({
    msg: `${id}번 할 일이 삭제되었습니다.`,
  });
});

// app.get("/", (req, res) => {
//   res.send("Hello World"); // res.send 에 인자는 문자로 들어가야 함, 숫자 x
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// app.delete("/todos/:id", async (req, res) => {
//   const { id } = req.params;

//   const [todorows] = await pool.query(
//     `
//     SELECT * FROM todo
//     WHERE id = ?
//     `,
//     [id]
//   );

//   if (todorows === undefined) {
//     res.status(404).json({
//       msg: "not found",
//     });
//   }

//   const [rs] = await pool.query(
//     `
//     DELETE * FROM todo
//     WHERE id = ?
//     `,
//     [id]
//   );

//   res.json({
//     msg: `${id}번 할 일이 삭제되었습니다.`,
//   });
// });
