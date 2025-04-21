import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoute.js";
import dotenv from "dotenv";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/payments.js";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// ✅ Middleware Configuration
app.use(bodyParser.json());
app.use(cookieParser()); // ✅ Enables parsing of cookies

// ✅ CORS Configuration (Handles Frontend Communication)
app.use(
  cors({
    origin: "http://127.0.0.1:5501", // ✅ Allow frontend origin
    credentials: true, // ✅ Allow cookies & authorization headers
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Allowed HTTP methods
  })
);

// ✅ Routes
app.use("/api", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/payment", paymentRoutes);
// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
