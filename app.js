import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

const port = 4000;
const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "a9",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getData = async () => {
  const data = await axios.get("http://localhost:4000/todos");
};

app.get("/todos", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM todo ORDER BY id");
  console.log("rows", rows);

  res.json(rows);
});

app.get("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.query(
    `
    SELECT * FROM todo
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

app.patch(`/todos/:id`, async (req, res) => {
  const { id } = req.params;
  const { perform_date, text } = req.body;

  const [rows] = await pool.query(
    `
    SELECT * FROM todo
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

  if (!text) {
    res.status(400).json({
      msg: "text required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE todo
    SET perform_date = ?, text = ?
    WHERE id = ?
    `,
    [perform_date, text, id]
  );

  res.json({
    msg: `${id}번 할 일이 수정되었습니다.`,
  });
});

app.patch("/todos/:id/check", async (req, res) => {
  const { id } = req.params;

  const [[todoRow]] = await pool.query(
    `
    SELECT * FROM todo
    WHERE id = ?
    `,
    [id]
  );

  if (!todoRow) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  await pool.query(
    `
    UPDATE todo
    SET checked = ?
    WHERE id = ?
    `,
    [!todoRow.checked, id]
  );

  const [updatedTodos] = await pool.query(
    `
    SELECT * FROM todo
    ORDER BY id
    `,
    [id]
  );

  res.json(updatedTodos);
});

app.post("/todos", async (req, res) => {
  const {
    body: { text },
  } = req;

  await pool.query(
    `
    INSERT INTO todo
    SET reg_date = NOW(),
    perform_date = '2022-08-08 12:00:00',
    checked = 0,
    text = ? ;
    `,
    [text]
  );

  const [[rows]] = await pool.query(
    `
    SELECT * FROM todo
    ORDER BY id DESC
    LIMIT 1
    `
  );

  res.json(rows);
});

app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params;

  const [[todoRows]] = await pool.query(
    `
  SELECT * FROM todo
  WHERE id = ?
  `,
    [id]
  );

  if (todoRows === undefined) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  const [rs] = await pool.query(
    // ==> [rs] 는 배열의 첫번째를 반환하는 것.
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
