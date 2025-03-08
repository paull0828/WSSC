const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  seatNumber: { type: Number, required: true },
  date: { type: String, required: true },
  plan: { type: String, required: true },
  timeSlot: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "booked" },

});

module.exports = mongoose.model("Booking", bookingSchema);
