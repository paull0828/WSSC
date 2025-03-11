const express = require("express");
const router = express.Router();
const { authenticateUser } = require("./authRoutes"); // ✅ Import the function
const Booking = require("../models/booking");

router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// // Fetch booked seats for a specific date
router.get("/:date", async (req, res) => {
  console.log("Fetching bookings for date:", req.params.date);
  try {
    const { date } = req.params;
    const bookings = await Booking.find({ date });
    console.log("Found bookings:", bookings);

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

// Create a new booking
router.post("/book-seat", authenticateUser, async (req, res) => {
  const { seatNumber, timeSlot } = req.body;
  try {
    const existingBooking = await Booking.findOne({ seatNumber, timeSlot });
    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "Seat already booked for this time slot." });
    }
    const booking = new Booking({ userId: req.userId, seatNumber, timeSlot });
    await booking.save();
    res.json({ message: "Seat booked successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error booking seat." });
  }
});

// Delete a booking (for admin or cancellations)
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
