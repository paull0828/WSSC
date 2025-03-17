import express from "express";
import Booking from "../models/booking.js";
import User from "../models/user.js";

const router = express.Router();

// ✅ Create a new booking (User must be logged in)
router.post("/book-seat", async (req, res) => {
  try {
    const { seatNumber, email, date, timeSlot, plan, price } = req.body;

    if (!seatNumber || !timeSlot || !date || !email) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Check if the seat is already booked for the same time slot & date
    const existingBooking = await Booking.findOne({
      seatNumber,
      date,
      timeSlot,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "❌ Seat already booked for this time slot." });
    }

    // Create new booking
    const newBooking = new Booking({
      seatNumber,
      email,
      date,
      timeSlot,
      plan,
      price,
    });

    await newBooking.save();

    // Find the user and update their bookings
    const user = await User.findOne({ email });
    if (user) {
      user.bookings.push(newBooking);
      await user.save();
    }

    console.log("✅ Seat booked successfully:", newBooking);
    res.json({ message: "✅ Seat booked successfully!", booking: newBooking });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ message: "Error booking seat." });
  }
});

// ✅ Get all seats that are not booked
router.get("/available-seats", async (req, res) => {
  try {
    const bookedSeats = await Booking.find({}, "seatNumber");
    const bookedSeatNumbers = bookedSeats.map((booking) => booking.seatNumber);
    const allSeats = Array.from({ length: 40 }, (_, i) => i + 1);
    const availableSeats = allSeats.filter((seat) =>
      bookedSeatNumbers.includes(seat)
    );
    res.json(availableSeats);
  } catch (error) {
    console.error("❌ Error fetching available seats:", error);
    res.status(500).json({ message: "Error fetching available seats." });
  }
});

export default router;
