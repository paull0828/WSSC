import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_KEY_SECRET",
});

// Create order
router.post("/create-order", async (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;

  const options = {
    amount: amount * 100, // amount in paise
    currency,
    receipt,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Order creation failed", details: err });
  }
});

// Verify payment (optional but good for security)
router.post("/verify", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sign = crypto
    .createHmac("sha256", "YOUR_KEY_SECRET")
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (sign === razorpay_signature) {
    res.json({ success: true, message: "Payment verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

export default router;
