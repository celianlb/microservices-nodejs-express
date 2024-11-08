require("dotenv").config();
const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
console.log("AUTH_SERVICE_URL:", AUTH_SERVICE_URL);
console.log("PRODUCT_SERVICE_URL:", PRODUCT_SERVICE_URL);
console.log("ORDER_SERVICE_URL:", ORDER_SERVICE_URL);

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ error: "Token manquant" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token invalide" });
    req.user = decoded;
    next();
  });
}

app.use("/auth", (req, res) =>
  axios({
    method: req.method,
    url: `${AUTH_SERVICE_URL}${req.path}`,
    data: req.body,
  })
    .then((response) => res.json(response.data))
    .catch((err) =>
      res.status(err.response?.status || 500).json(err.response?.data)
    )
);

app.use("/products", verifyToken, async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${PRODUCT_SERVICE_URL}${req.path}`,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: "Erreur interne du serveur" };
    res.status(status).json(data);
  }
});

app.use("/orders", verifyToken, (req, res) =>
  axios({
    method: req.method,
    url: `${ORDER_SERVICE_URL}${req.path}`,
    data: req.body,
  })
    .then((response) => res.json(response.data))
    .catch((err) =>
      res.status(err.response?.status || 500).json(err.response?.data)
    )
);

app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
