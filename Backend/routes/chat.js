import express from "express";
import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import verifyToken from "../middleware/auth.js";
import getOpenAIAPIResponse from "../utils/openai.js";

const router = express.Router();

router.use(verifyToken);

// Serverless cold starts can lose the Mongo connection between invocations,
// so every route re-checks it — same pattern as auth.js.
const ensureDBConnected = async () => {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
};

router.get("/thread", async (req, res) => {
    try {
        await ensureDBConnected();
        const threads = await Thread.find({ userId: req.userId }).sort({ updatedAt: -1 });
        res.json(threads);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch threads" });
    }
});

router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        await ensureDBConnected();
        const thread = await Thread.findOne({ threadId, userId: req.userId });
        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.json(thread.messages);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch chat" });
    }
});

router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;
    try {
        await ensureDBConnected();
        const deletedThread = await Thread.findOneAndDelete({ threadId, userId: req.userId });
        if (!deletedThread) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json({ success: "Thread deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to delete thread" });
    }
});

// POST /api/chat — streams the reply back as Server-Sent Events:
//   data: {"chunk":"..."}      — one per fragment as it arrives
//   data: {"done":true}        — stream finished successfully
//   data: {"error":"..."}      — something failed mid-stream
//
// Body: { threadId, message } for a normal send, or
//       { threadId, regenerate: true } to redo the last assistant reply
//       using the same history, without duplicating the user turn.
router.post("/chat", async (req, res) => {
    const { threadId, message, regenerate } = req.body;

    if (!threadId || (!regenerate && !message?.trim())) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        await ensureDBConnected();

        // Query by YOUR threadId field (a client-generated UUID) — never by
        // Mongo's `_id`, which is a different kind of value entirely.
        let thread = await Thread.findOne({ threadId, userId: req.userId });

        if (regenerate) {
            if (!thread || !thread.messages.length) {
                return res.status(404).json({ error: "Thread not found" });
            }
            if (thread.messages[thread.messages.length - 1].role === "assistant") {
                thread.messages.pop();
            }
        } else if (!thread) {
            thread = new Thread({
                threadId,
                userId: req.userId,
                title: message.slice(0, 40),
                messages: [{ role: "user", content: message }]
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        // Full history, so the model actually has memory of the thread.
        const conversation = thread.messages.map(m => ({ role: m.role, content: m.content }));

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        const assistantReply = await getOpenAIAPIResponse(conversation, (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        });

        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();
        await thread.save();

        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
    } catch (err) {
        console.error("Chat error:", err);
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: "something went wrong" })}\n\n`);
            res.end();
        } else {
            res.status(500).json({ error: "Failed to generate response" });
        }
    }
});

export default router;