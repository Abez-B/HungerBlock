import { Request, Response, NextFunction } from "express";
import { SiweMessage } from "siwe";
import jwt from "jsonwebtoken";
import { prisma } from "../index";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        walletAddress: string;
        role: string;
    };
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.substring(7);

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            walletAddress: string;
            role: string;
        };

        // Verify user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = {
            id: user.id,
            walletAddress: user.walletAddress,
            role: user.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

/**
 * Verify SIWE (Sign-In with Ethereum) message
 */
export async function verifySiweMessage(message: string, signature: string) {
    try {
        const siweMessage = new SiweMessage(message);
        const fields = await siweMessage.verify({ signature });

        return {
            success: true,
            address: fields.data.address,
        };
    } catch (error) {
        return {
            success: false,
            error: "Invalid signature",
        };
    }
}

/**
 * Generate JWT token for user
 */
export function generateToken(userId: string, walletAddress: string, role: string) {
    return jwt.sign(
        { userId, walletAddress, role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
        }

        next();
    };
}
