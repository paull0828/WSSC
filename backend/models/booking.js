const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    seatNumber: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
