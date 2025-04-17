import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  timeSlot: { type: String, required: true },
  date: { type: Date, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User model
  plan: { type: String },
  price: { type: Number },
});

export default mongoose.model("Booking", bookingSchema);
