import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ **Register Route**
router.post("/register", async (req, res) => {
  try {
    console.log("📥 Registration Request:", req.body);

    const {
      firstname,
      lastname,
      age,
      gender,
      mobileno,
      email,
      password,
      confirmPassword,
    } = req.body;

    // Validation
    if (
      !firstname ||
      !lastname ||
      !age ||
      !gender ||
      !mobileno ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      age,
      gender,
      mobileno,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    console.log("✅ User Registered:", newUser);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// ✅ **Login Route**
router.post("/login", async (req, res) => {
  try {
    console.log("📥 Login Request:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "1h" }
    );

    console.log("✅ User Logged In:", user);

    res.status(200).json({ message: "Login successful!", user, token });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// ✅ **Get Logged-in User Data**
router.get("/me", async (req, res) => {
  const email = req.headers["x-user-email"];
  console.log("👤 Fetching User:", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// ✅ **Logout Route**
router.post("/logout", (req, res) => {
  res.clearCookie("token", { path: "/" });
  res.status(200).json({ message: "Logged out successfully!" });
});

export default router;
