const express = require("express");
const router = express.Router();
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
router.post("/book", async (req, res) => {
  try {
    console.log("Received booking request:", req.body);
    const { seatNumber, date, timeSlot, plan, price } = req.body;

    // Check if seat is already booked for the given date
    const existingBooking = await Booking.findOne({ seatNumber, date });

    if (existingBooking) {
      return res.status(400).json({ message: "Seat already booked!" });
    }

    // Save new booking
    const newBooking = new Booking({
      seatNumber,
      date,
      timeSlot,
      plan,
      price,
    });
    await newBooking.save();
    console.log("Booking saved successfully:", newBooking);

    res.status(201).json({ message: "Booking successful!" });
  } catch (error) {
    console.error("error booking seats: ", error)
    res.status(500).json({ message: "Internal server error", error });
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
