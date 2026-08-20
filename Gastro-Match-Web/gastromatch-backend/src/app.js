const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "GastroMatch API", timestamp: new Date().toISOString() });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/chefs", require("./routes/chefRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.use((req, res) => res.status(404).json({ message: "Rota não encontrada." }));

module.exports = app;