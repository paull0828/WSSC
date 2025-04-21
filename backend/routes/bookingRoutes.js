import express from "express";
const router = express.Router();
import Booking from "../routes/Booking.js";

/**
 * Get available seats for a specific date and time slot
 * POST /api/bookings/available-seats
 */

router.post("/initialize-seats", async (req, res) => {
  try {
    const seats = [];
    for (let i = 1; i <= 40; i++) {
      seats.push({
        seatNumber: i,
        email: null, // No user assigned initially
        date: null, // No date assigned initially
        timeSlot: null, // No time slot assigned initially
        plan: null, // No plan assigned initially
        price: 0, // No price assigned initially
        createdAt: new Date(),
        expiresAt: null, // No expiration initially
      });
    }

    await Booking.insertMany(seats);
    res.status(201).json({ message: "40 seats initialized successfully." });
  } catch (error) {
    console.error("Error initializing seats:", error);
    res.status(500).json({ message: "Error initializing seats." });
  }
});

/**
 * Book a seat
 * POST /api/bookings/book-seat
 */
// Book a seat
router.post("/book-seat", async (req, res) => {
  const { seatNumber, email, date, timeSlot, plan, price } = req.body;

  if (!seatNumber || !email || !date || !timeSlot || !plan || !price) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Check if seat is already booked for the same date and time slot
    const existing = await Booking.findOne({ seatNumber, date, timeSlot });

    if (existing) {
      return res.status(400).json({ message: "Seat already booked." });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30-day booking

    const newBooking = new Booking({
      seatNumber,
      email,
      date,
      timeSlot,
      plan,
      price,
      createdAt: new Date(),
      expiresAt,
    });

    console.log("Attempting to save booking:", newBooking);

    const savedBooking = await newBooking.save();
    console.log("Booking saved successfully:", savedBooking);

    res.status(201).json({
      message: `Seat ${seatNumber} booked successfully.`,
      booking: savedBooking,
    });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Failed to book seat." });
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
