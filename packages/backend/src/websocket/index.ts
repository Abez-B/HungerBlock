import { Server, Socket } from "socket.io";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

interface AuthenticatedSocket extends Socket {
    userId?: string;
    walletAddress?: string;
    role?: string;
}

export function initializeWebSocket(io: Server) {
    // Authentication middleware
    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        try {
            const decoded = verify(token, JWT_SECRET) as {
                userId: string;
                walletAddress: string;
                role: string;
            };

            socket.userId = decoded.userId;
            socket.walletAddress = decoded.walletAddress;
            socket.role = decoded.role;

            next();
        } catch (error) {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`🔌 Client connected: ${socket.userId}`);

        // Join user-specific room
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
        }

        // Join role-specific rooms
        if (socket.role) {
            socket.join(`role:${socket.role}`);
        }

        // Handle custom events
        socket.on("subscribe:donation", (donationId: string) => {
            socket.join(`donation:${donationId}`);
            console.log(`User ${socket.userId} subscribed to donation ${donationId}`);
        });

        socket.on("subscribe:request", (requestId: string) => {
            socket.join(`request:${requestId}`);
            console.log(`User ${socket.userId} subscribed to request ${requestId}`);
        });

        socket.on("unsubscribe:donation", (donationId: string) => {
            socket.leave(`donation:${donationId}`);
        });

        socket.on("unsubscribe:request", (requestId: string) => {
            socket.leave(`request:${requestId}`);
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.userId}`);
        });
    });

    return io;
}

// Utility functions for emitting to specific rooms
export function notifyUser(io: Server, userId: string, event: string, data: any) {
    io.to(`user:${userId}`).emit(event, data);
}

export function notifyRole(io: Server, role: string, event: string, data: any) {
    io.to(`role:${role}`).emit(event, data);
}

export function notifyDonation(io: Server, donationId: string, event: string, data: any) {
    io.to(`donation:${donationId}`).emit(event, data);
}

export function notifyRequest(io: Server, requestId: string, event: string, data: any) {
    io.to(`request:${requestId}`).emit(event, data);
}
