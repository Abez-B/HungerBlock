import { Router } from "express";
import { prisma } from "../index";
import { verifySiweMessage, generateToken } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const loginSchema = z.object({
    message: z.string(),
    signature: z.string(),
});

const registerSchema = z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    role: z.enum(["DONOR", "NGO", "VERIFIER", "ADMIN"]),
    name: z.string().optional(),
    email: z.string().email().optional(),
});

/**
 * POST /api/auth/login
 * Sign in with Ethereum (SIWE)
 */
router.post("/login", async (req, res, next) => {
    try {
        const { message, signature } = loginSchema.parse(req.body);

        // Verify SIWE message
        const verification = await verifySiweMessage(message, signature);

        if (!verification.success) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        // Find or create user
        let user = await prisma.user.findUnique({
            where: { walletAddress: verification.address },
        });

if (!user) {
  // Auto-create user with DONOR role
  user = await prisma.user.create({
    data: {
      walletAddress: verification.address!,
      role: "DONOR",
    },
  });
}

        // Generate JWT token
        const token = generateToken(user.id, user.walletAddress, user.role);

        res.json({
            token,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                role: user.role,
                name: user.name,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/register
 * Register new user
 */
router.post("/register", async (req, res, next) => {
    try {
        const data = registerSchema.parse(req.body);

        // Check if user already exists
        const existing = await prisma.user.findUnique({
            where: { walletAddress: data.walletAddress },
        });

        if (existing) {
            return res.status(400).json({ error: "User already registered" });
        }

        const user = await prisma.user.create({
            data,
        });

        res.status(201).json({
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/nonce
 * Get nonce for SIWE message
 */
router.get("/nonce", (req, res) => {
    // Generate random nonce
    const nonce = Math.floor(Math.random() * 1000000).toString();
    res.json({ nonce });
});

export default router;
