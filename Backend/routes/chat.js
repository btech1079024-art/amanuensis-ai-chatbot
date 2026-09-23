import express from "express";
import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import verifyToken from "../middleware/auth.js";
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();

const ensureDBConnected = async () => {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
};

router.post("/", verifyToken, async (req, res) => {
    try {
        await ensureDBConnected();

        const { message, threadId } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ error: "Message is required" });
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const aiResponse = await getOpenAIAPIResponse(message, (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        });

        let thread;
        if (threadId) {
            thread = await Thread.findOne({ _id: threadId, userId: req.userId });
        }

        if (!thread) {
            thread = new Thread({
                userId: req.userId,
                title: message.slice(0, 30) + "...",
                messages: [],
            });
        }

        thread.messages.push({ role: "user", content: message });
        thread.messages.push({ role: "assistant", content: aiResponse });
        await thread.save();

        res.write(`data: ${JSON.stringify({ done: true, threadId: thread._id })}\n\n`);
        res.end();
    } catch (err) {
        console.error("Chat error:", err);
        if (!res.headersSent) {
            res.status(500).json({ error: "Failed to generate response" });
        } else {
            res.write(`data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`);
            res.end();
        }
    }
});

export default router;