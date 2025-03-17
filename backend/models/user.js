import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true },
  plan: { type: String, required: true },
  timeSlot: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "booked" },
});

const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  age: { type: Number, required: true, min: 15, max: 70 },
  gender: { type: String, required: true },
  mobileno: { type: String, required: true, match: /^[0-9]{10}$/ },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bookings: [BookingSchema],
});

export default mongoose.model("User", UserSchema);
