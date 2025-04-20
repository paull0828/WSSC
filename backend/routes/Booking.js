import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  seatNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Create a compound index to ensure uniqueness of seat bookings for a specific date and time slot
bookingSchema.index({ seatNumber: 1, date: 1, timeSlot: 1 }, { unique: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
