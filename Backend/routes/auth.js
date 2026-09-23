import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Helper to ensure MongoDB is connected before running database queries on Vercel
const ensureDBConnected = async () => {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
};

router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    try {
        await ensureDBConnected();

        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ error: "An account with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Something went wrong creating your account" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        await ensureDBConnected();

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Something went wrong logging you in" });
    }
});

// Lets the frontend check "is this stored token still valid?" on page load,
// and get back fresh user info, without forcing a login every refresh.
router.get("/me", verifyToken, async (req, res) => {
    try {
        await ensureDBConnected();

        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

export default router;