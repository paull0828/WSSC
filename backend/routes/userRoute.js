import express from "express";
import User from "../models/user.js";

const router = express.Router();

// ✅ Get user data by email from headers
router.get("/profile", async (req, res) => {
  try {
    const email = req.headers.authorization.split(" ")[1];
    const user = await User.findOne({ email }).populate("bookings");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

export default router;
