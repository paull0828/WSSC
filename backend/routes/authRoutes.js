const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log("📥 Received Data:", req.body);

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

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      age,
      gender,
      mobileno,
      email,
      password: hashedPassword, // Store hashed password
    });

    await newUser.save();
    console.log("✅ User Registered:", newUser);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log("📥 Login Request Received:", req.body);

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    console.log("✅ User Logged In:", user);

    res.status(200).json({ message: "Login successful!", token, user });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

module.exports = router;
