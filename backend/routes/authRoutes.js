import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
const router = express.Router();
import dotenv from "dotenv";

dotenv.config();

// Middleware for authentication
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token; // Get JWT token from cookies

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret"
    );
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ error: "Invalid or expired token. Please log in again." });
  }
};

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
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    console.log("✅ User Logged In:", user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful!", user });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});

// ✅ **Get Logged-in User Data**
router.get("/me", authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user, userEmail: req.user.email });
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
