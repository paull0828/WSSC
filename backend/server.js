const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
connectDB();

app.use(
  cors({
    origin: "http://127.0.0.1:5501", // Allow only this origin
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
app.use(bodyParser.json());
app.use("/api", authRoutes);
app.use("/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
