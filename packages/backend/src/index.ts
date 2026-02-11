import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";

// Import routes
import donationRoutes from "./routes/donations";
import requestRoutes from "./routes/requests";
import matchRoutes from "./routes/matches";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import aiRoutes from "./routes/ai";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";

// Import WebSocket handler
import { initializeWebSocket } from "./websocket";

// Import blockchain service
import { blockchainService } from "./services/blockchain";

// Load environment variables
dotenv.config();

// Initialize Prisma
export const prisma = new PrismaClient();

// Initialize Redis
export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Create Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
export const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    },
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/ai", aiRoutes);

// Error handling
app.use(errorHandler);

// Initialize WebSocket
initializeWebSocket(io);

// Start server
const PORT = process.env.PORT || 4000;

async function startServer() {
    try {
        // Connect to database
        await prisma.$connect();
        console.log("✅ Database connected");

        // Test Redis connection
        await redis.ping();
        console.log("✅ Redis connected");

        // Start blockchain event listener
        await blockchainService.startEventListeners();
        console.log("✅ Blockchain event listeners started");

        // Start HTTP server
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\n⏳ Shutting down gracefully...");

    await prisma.$disconnect();
    await redis.quit();
    httpServer.close();

    console.log("✅ Server shut down complete");
    process.exit(0);
});

startServer();

export default app;
