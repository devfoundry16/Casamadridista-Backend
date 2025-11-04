const express = require("express");
const dotenv = require("dotenv");
const stripe = require("./routes/stripe");

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use("/api/stripe", stripe);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
