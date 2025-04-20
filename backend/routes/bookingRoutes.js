import express from "express";
const router = express.Router();
import Booking from "../models/Booking.js";

/**
 * Get available seats for a specific date and time slot
 * POST /api/bookings/available-seats
 */
router.post("/available-seats", async (req, res) => {
  try {
    const { date, timeSlot } = req.body;

    if (!date || !timeSlot) {
      return res
        .status(400)
        .json({ message: "Date and time slot are required" });
    }

    // Parse the date to ensure it's in the correct format
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0); // Set to beginning of day

    // Find all bookings for the specified date and time slot
    const bookings = await Booking.find({
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000), // Next day
      },
      timeSlot: timeSlot,
      expiresAt: { $gt: new Date() }, // Only consider non-expired bookings
    });

    // Extract seat numbers from bookings
    const bookedSeats = bookings.map((booking) => booking.seatNumber);
    console.log("Booked seats:", bookedSeats);
    res.json({ bookedSeats });
  } catch (error) {
    console.error("Error fetching available seats:", error);
    res.status(500).json({ message: "Failed to fetch available seats" });
  }
});

/**
 * Book a seat
 * POST /api/bookings/book-seat
 */
router.post("/book-seat", async (req, res) => {
  try {
    const { seatNumber, email, date, timeSlot, plan, price } = req.body;

    // Validate required fields
    if (!seatNumber || !email || !date || !timeSlot || !plan || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Parse the date to ensure it's in the correct format
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0); // Set to beginning of day

    // Check if the seat is already booked for this date and time slot
    const existingBooking = await Booking.findOne({
      seatNumber: seatNumber,
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000), // Next day
      },
      timeSlot: timeSlot,
      expiresAt: { $gt: new Date() }, // Only consider non-expired bookings
    });

    if (existingBooking) {
      return res.status(409).json({
        message:
          "This seat is already booked for the selected date and time slot",
      });
    }

    // Calculate expiration date (30 days from booking date)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create new booking
    const newBooking = new Booking({
      seatNumber: Number.parseInt(seatNumber),
      email,
      date: bookingDate,
      timeSlot,
      plan,
      price: Number.parseInt(price),
      expiresAt,
    });

    await newBooking.save();

    res.status(201).json({
      message: "Seat booked successfully",
      booking: {
        id: newBooking._id,
        seatNumber: newBooking.seatNumber,
        date: newBooking.date,
        timeSlot: newBooking.timeSlot,
        expiresAt: newBooking.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error booking seat:", error);

    // Handle duplicate key error (trying to book an already booked seat)
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "This seat is already booked for the selected date and time slot",
      });
    }

    res.status(500).json({ message: "Failed to book seat" });
  }
});

/**
 * Get all bookings for a user
 * GET /api/bookings/user/:email
 */
router.get("/user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const bookings = await Booking.find({
      email,
      expiresAt: { $gt: new Date() }, // Only return non-expired bookings
    }).sort({ date: 1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

export default router;
