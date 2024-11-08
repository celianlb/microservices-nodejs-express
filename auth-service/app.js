const express = require("express");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post("/register", async (req, res) => {
  console.log("Body Request :", req.body);
  const { username, password } = req.body;
  if (!password) {
    return res.status(400).json({ error: "Le mot de passe est requis" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
      username,
      hashedPassword,
    ]);
    res.status(201).json({ message: "Utilisateur créé" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Erreur lors de la création de l’utilisateur" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  const user = result.rows[0];
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Identifiants incorrects" });
  }
});

app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));
