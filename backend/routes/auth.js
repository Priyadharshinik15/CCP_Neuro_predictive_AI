import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

import multer from "multer";  // <-- Add this import
const router = express.Router();
import auth from "../middleware/auth.js"; // <-- fix import
// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "Email already used" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({
    user: { id: user._id, name: user.name, email: user.email },
    token
  });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({
    user: { id: user._id, name: user.name, email: user.email },
    token
  });
});


// Update profile route
router.put("/update-profile", auth, upload.single("profilePhoto"), async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = { name, email };

    if (req.file) updates.profilePhoto = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

export default router;




