import express from "express";
import User from "../models/user.js";
import Booking from "./Booking.js";

const router = express.Router();

// ✅ Get user data by email from headers
router.get("/profile", async (req, res) => {
  try {
    const email = req.headers.authorization?.split(" ")[1];

    if (!email) {
      return res.status(400).json({ message: "Email not provided" });
    }

    // Find user info
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find bookings by email
    const bookings = await Booking.find({ email }).lean();

    // Format bookings with status
    const formattedBookings = bookings.map((booking) => ({
      seatNumber: booking.seatNumber,
      date: booking.date.toISOString().split("T")[0],
      timeSlot: booking.timeSlot,
      plan: booking.plan,
      price: booking.price,
      status: new Date() > new Date(booking.expiresAt) ? "Expired" : "Active",
    }));

    // Respond with user data and bookings
    res.json({
      firstname: user.firstname,
      email: user.email,
      bookings: formattedBookings,
    });
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

export default router;
