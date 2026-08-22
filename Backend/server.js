import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";


const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors()); // TODO: restrict to your frontend's URL before deploying


app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler (catches anything unhandled)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong on the server" });
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with Database!");
    } catch (err) {
        console.log("Failed to connect with DB", err);
        process.exit(1); // don't run the server with a broken DB connection
    }
};

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
