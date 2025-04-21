import express from "express";
import User from "../models/user.js";
import Booking from "../routes/Booking.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    res.cookie("adminToken", "someToken", { httpOnly: true });
    return res.json({ success: true });
  }

  console.log("Invalid login attempt");
  res.status(401).json({ success: false, message: "Invalid credentials" });
});
// ✅ Admin - Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find(
      {},
      "firstname lastname email age gender mobileno"
    );
    res.json(users);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// ✅ Admin - Delete a user by ID
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    await Booking.deleteMany({ user: userId }); // Remove associated bookings
    res.json({ success: true, message: "User and their bookings deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ✅ Admin - Get all booking details with user info
router.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    console.error("Failed to fetch bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

export default router;
