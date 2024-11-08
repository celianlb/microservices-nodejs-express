const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());
const PORT = 3003;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/orders", async (req, res) => {
  const userId = req.user.userId;
  const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
    userId,
  ]);
  res.json(result.rows);
});

app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));
