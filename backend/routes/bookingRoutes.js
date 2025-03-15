import express from "express";
const router = express.Router();
//import { authenticateUser } from "./authRoutes"; // ✅ Import authentication
import Booking from "../models/booking.js";

// ✅ Fetch all bookings (Admin or Dashboard Use)
router.get("/book", async (req, res) => {
  try {
    const bookings = await Booking.find().populate(
      "userId",
      "firstname lastname email"
    );
    res.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching all bookings:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Fetch booked seats for a specific date
router.get("/:date", async (req, res) => {
  console.log("📅 Fetching bookings for date:", req.params.date);
  try {
    const { date } = req.params;
    const bookings = await Booking.find({ date }).populate(
      "userId",
      "firstname lastname email"
    );

    console.log("✅ Found bookings:", bookings);
    res.json(bookings);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// ✅ Create a new booking (User must be logged in)
router.post("/book-seat", async (req, res) => {
  try {
    const { seatNumber, timeSlot, date } = req.body;

    if (!seatNumber || !timeSlot || !date) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the seat is already booked for the same time slot & date
    const existingBooking = await Booking.findOne({
      seatNumber,
      timeSlot,
      date,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "❌ Seat already booked for this time slot." });
    }

    // Create new booking
    const newBooking = new Booking({
      userId: req.user.userId, // Get user ID from JWT
      seatNumber,
      timeSlot,
      date,
    });

    await newBooking.save();
    console.log("✅ Seat booked successfully:", newBooking);
    res.json({ message: "✅ Seat booked successfully!", booking: newBooking });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ message: "Error booking seat." });
  }
});

// ✅ Delete a booking (Only Admin or User who booked can delete)
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // Check if the logged-in user is the owner of the booking
    if (booking.userId.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this booking." });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Booking deleted successfully." });
  } catch (error) {
    console.error("❌ Deletion Error:", error);
    res.status(500).json({ message: "Error deleting booking." });
  }
});

export default router;
