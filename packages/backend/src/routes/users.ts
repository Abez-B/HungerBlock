import { Router } from "express";
import { prisma } from "../index";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                walletAddress: true,
                role: true,
                name: true,
                email: true,
                verified: true,
                createdAt: true,
            },
        });

        res.json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/users/me
 * Update current user profile
 */
router.patch("/me", authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { name, email } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: { name, email },
            select: {
                id: true,
                walletAddress: true,
                role: true,
                name: true,
                email: true,
            },
        });

        res.json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/users/:address/stats
 * Get user statistics
 */
router.get("/:address/stats", async (req, res, next) => {
    try {
        const { address } = req.params;

        const user = await prisma.user.findUnique({
            where: { walletAddress: address },
            include: {
                _count: {
                    select: {
                        donations: true,
                        requests: true,
                        verifications: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get verified donations count
        const verifiedDonations = await prisma.donation.count({
            where: {
                donorId: user.id,
                status: "VERIFIED",
            },
        });

        res.json({
            totalDonations: user._count.donations,
            verifiedDonations,
            totalRequests: user._count.requests,
            totalVerifications: user._count.verifications,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
