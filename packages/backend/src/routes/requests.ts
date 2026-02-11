import { Router } from "express";
import { prisma } from "../index";
import { io } from "../index";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const createRequestSchema = z.object({
    foodType: z.string(),
    quantityNeeded: z.number().int().positive(),
    location: z.string(),
    urgencyLevel: z.number().int().min(1).max(5),
});

/**
 * POST /api/requests
 * Create new request (NGO only)
 */
router.post(
    "/",
    authenticate,
    requireRole("NGO", "ADMIN"),
    async (req: AuthRequest, res, next) => {
        try {
            const data = createRequestSchema.parse({
                ...req.body,
                quantityNeeded: parseInt(req.body.quantityNeeded),
                urgencyLevel: parseInt(req.body.urgencyLevel),
            });

            const request = await prisma.request.create({
                data: {
                    ngoId: req.user!.id,
                    foodType: data.foodType,
                    quantityNeeded: data.quantityNeeded,
                    location: data.location,
                    urgencyLevel: data.urgencyLevel,
                    requestId: 0, // Will be updated after blockchain transaction
                    status: "OPEN",
                },
            });

            io.emit("request:created", {
                id: request.id,
                ngo: req.user!.walletAddress,
                foodType: data.foodType,
                quantityNeeded: data.quantityNeeded,
                urgencyLevel: data.urgencyLevel,
            });

            res.status(201).json(request);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/requests
 * List requests with filters
 */
router.get("/", async (req, res, next) => {
    try {
        const { status, ngoAddress, limit = "20", offset = "0" } = req.query;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (ngoAddress) {
            const ngo = await prisma.user.findUnique({
                where: { walletAddress: ngoAddress as string },
            });

            if (ngo) {
                where.ngoId = ngo.id;
            }
        }

        const requests = await prisma.request.findMany({
            where,
            include: {
                ngo: {
                    select: {
                        walletAddress: true,
                        name: true,
                    },
                },
            },
            orderBy: [
                { urgencyLevel: "desc" },
                { createdAt: "desc" },
            ],
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
        });

        const total = await prisma.request.count({ where });

        res.json({
            requests,
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/requests/:id
 * Get request details
 */
router.get("/:id", async (req, res, next) => {
    try {
        const request = await prisma.request.findUnique({
            where: { id: req.params.id },
            include: {
                ngo: {
                    select: {
                        walletAddress: true,
                        name: true,
                    },
                },
                match: {
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
                    },
                },
            },
        });

        if (!request) {
            return res.status(404).json({ error: "Request not found" });
        }

        res.json(request);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/requests/:id/cancel
 * Cancel request (NGO only)
 */
router.patch(
    "/:id/cancel",
    authenticate,
    requireRole("NGO", "ADMIN"),
    async (req: AuthRequest, res, next) => {
        try {
            const request = await prisma.request.findUnique({
                where: { id: req.params.id },
            });

            if (!request) {
                return res.status(404).json({ error: "Request not found" });
            }

            if (request.ngoId !== req.user!.id && req.user!.role !== "ADMIN") {
                return res.status(403).json({ error: "Not authorized" });
            }

            if (request.status !== "OPEN") {
                return res.status(400).json({ error: "Can only cancel open requests" });
            }

            const updated = await prisma.request.update({
                where: { id: req.params.id },
                data: { status: "CANCELLED" },
            });

            io.emit("request:cancelled", { id: updated.id });

            res.json(updated);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
