const express = require("express");
const { Pool } = require("pg");
const app = express();
app.use(express.json());
const PORT = 3002;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
});

app.listen(PORT, () => console.log(`Product service running on port ${PORT}`));
