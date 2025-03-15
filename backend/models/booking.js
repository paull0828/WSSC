import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  date: { type: String, required: true },
  plan: { type: String, required: true },
  timeSlot: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "booked" },
});

export default mongoose.model("Booking", bookingSchema);
