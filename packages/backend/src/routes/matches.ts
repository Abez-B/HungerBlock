import { Router } from "express";
import { prisma } from "../index";
import { io } from "../index";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";
import { blockchainService } from "../services/blockchain";
import { z } from "zod";

const router = Router();

const createMatchSchema = z.object({
    donationId: z.string(),
    requestId: z.string(),
});

/**
 * POST /api/matches
 * Create match between donation and request (Admin only)
 */
router.post(
    "/",
    authenticate,
    requireRole("ADMIN"),
    async (req: AuthRequest, res, next) => {
        try {
            const { donationId, requestId } = createMatchSchema.parse(req.body);

            // Verify donation and request exist and are available
            const donation = await prisma.donation.findUnique({
                where: { id: donationId },
            });

            const request = await prisma.request.findUnique({
                where: { id: requestId },
            });

            if (!donation || !request) {
                return res.status(404).json({ error: "Donation or request not found" });
            }

            if (donation.status !== "ACTIVE") {
                return res.status(400).json({ error: "Donation is not available" });
            }

            if (request.status !== "OPEN") {
                return res.status(400).json({ error: "Request is not available" });
            }

            if (donation.quantity < request.quantityNeeded) {
                return res.status(400).json({ error: "Insufficient donation quantity" });
            }

            // Create match in database
            const match = await prisma.match.create({
                data: {
                    matchId: 0, // Will be updated after blockchain transaction
                    donationId,
                    requestId,
                },
            });

            // Update statuses
            await prisma.donation.update({
                where: { id: donationId },
                data: { status: "MATCHED" },
            });

            await prisma.request.update({
                where: { id: requestId },
                data: { status: "MATCHED" },
            });

            // Emit WebSocket events
            io.emit("match:created", {
                matchId: match.id,
                donationId,
                requestId,
            });

            res.status(201).json(match);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/matches
 * List matches
 */
router.get("/", authenticate, async (req, res, next) => {
    try {
        const { verified, limit = "20", offset = "0" } = req.query;

        const where: any = {};

        if (verified !== undefined) {
            where.verified = verified === "true";
        }

        const matches = await prisma.match.findMany({
            where,
            include: {
                donation: {
                    include: {
                        donor: {
                            select: {
                                walletAddress: true,
                                name: true,
                            },
                        },
                    },
                },
                request: {
                    include: {
                        ngo: {
                            select: {
                                walletAddress: true,
                                name: true,
                            },
                        },
                    },
                },
                verification: true,
            },
            orderBy: { matchedAt: "desc" },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
        });

        const total = await prisma.match.count({ where });

        res.json({
            matches,
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/matches/:id/verify
 * Verify a match (Verifier only)
 */
router.post(
    "/:id/verify",
    authenticate,
    requireRole("VERIFIER", "ADMIN"),
    async (req: AuthRequest, res, next) => {
        try {
            const match = await prisma.match.findUnique({
                where: { id: req.params.id },
                include: {
                    donation: true,
                    request: true,
                },
            });

            if (!match) {
                return res.status(404).json({ error: "Match not found" });
            }

            if (match.verified) {
                return res.status(400).json({ error: "Match already verified" });
            }

            // TODO: Call blockchain service to verify donation on-chain
            // This would require verifier's private key

            // Update match and statuses
            const updated = await prisma.match.update({
                where: { id: req.params.id },
                data: { verified: true },
            });

            await prisma.donation.update({
                where: { id: match.donationId },
                data: { status: "VERIFIED" },
            });

            await prisma.request.update({
                where: { id: match.requestId },
                data: { status: "FULFILLED" },
            });

            // Create verification record
            const verification = await prisma.verification.create({
                data: {
                    matchId: match.id,
                    verifierId: req.user!.id,
                    rewardAmount: "0", // Will be updated from blockchain
                    txHash: "pending",
                    blockNumber: 0,
                },
            });

            // Emit WebSocket event
            io.emit("match:verified", {
                matchId: match.id,
                verifier: req.user!.walletAddress,
            });

            res.json({ match: updated, verification });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/matches/suggest
 * Get suggested matches for donations
 */
router.get("/suggest", authenticate, async (req, res, next) => {
    try {
        // Get all active donations and open requests
        const donations = await prisma.donation.findMany({
            where: { status: "ACTIVE" },
            include: {
                donor: { select: { walletAddress: true } },
            },
        });

        const requests = await prisma.request.findMany({
            where: { status: "OPEN" },
            include: {
                ngo: { select: { walletAddress: true } },
            },
        });

        // Simple matching algorithm
        const suggestions = [];

        for (const donation of donations) {
            const compatibleRequests = requests.filter((request: typeof requests[0]) => {
                return (
                    donation.quantity >= request.quantityNeeded &&
                    donation.foodType.toLowerCase().includes(request.foodType.toLowerCase()) ||
                    request.foodType.toLowerCase().includes(donation.foodType.toLowerCase())
                );
            });

            // Sort by urgency
            compatibleRequests.sort((a: typeof compatibleRequests[0], b: typeof compatibleRequests[0]) => b.urgencyLevel - a.urgencyLevel);

            if (compatibleRequests.length > 0) {
                suggestions.push({
                    donation,
                    suggestedRequest: compatibleRequests[0],
                    score: compatibleRequests[0].urgencyLevel * 20 + donation.freshnessScore,
                });
            }
        }

        // Sort by score
        suggestions.sort((a, b) => b.score - a.score);

        res.json({ suggestions });
    } catch (error) {
        next(error);
    }
});

export default router;
