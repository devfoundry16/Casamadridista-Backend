const express = require("express");
const dotenv = require("dotenv");
const paypalRoutes = require("./routes/paypalRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const matchRoutes = require("./routes/matchRoutes");
const profileRoutes = require("./routes/profileRoutes");

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/api/paypal", paypalRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/paypal", paypalRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
