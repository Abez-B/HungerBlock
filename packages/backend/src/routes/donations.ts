import { Router } from "express";
import multer from "multer";
import { prisma } from "../index";
import { io } from "../index";
import { authenticate, AuthRequest } from "../middleware/auth";
import { ipfsService } from "../services/ipfs";
import { blockchainService } from "../services/blockchain";
import { z } from "zod";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const createDonationSchema = z.object({
    foodType: z.string(),
    quantity: z.number().int().positive(),
    expiryTimestamp: z.number().int(),
    location: z.string(),
    freshnessScore: z.number().int().min(0).max(100),
});

// Simplified endpoint for testing (no auth required)
const simpleDonationSchema = z.object({
    foodType: z.string(),
    quantity: z.number().int().positive(),
    unit: z.string().optional(),
    expiryDate: z.string(),
    location: z.string(),
    notes: z.string().optional(),
    imageUrl: z.string().optional(),
    status: z.string().optional(),
});

router.post("/simple", async (req, res, next) => {
    try {
        const data = simpleDonationSchema.parse({
            ...req.body,
            quantity: parseInt(req.body.quantity),
        });

        // Create donation in database without authentication
        const donation = await prisma.donation.create({
            data: {
                donorId: "default-donor-id", // Placeholder
                foodType: data.foodType,
                quantity: data.quantity,
                ipfsHash: data.imageUrl || "placeholder-hash",
                expiryTimestamp: new Date(data.expiryDate),
                location: data.location,
                freshnessScore: 85, // Default freshness
                donationId: 0,
                status: "ACTIVE",
            },
        });

        res.status(201).json({
            success: true,
            donation,
            message: "Donation created successfully!",
        });
    } catch (error) {
        console.error("Error creating donation:", error);
        next(error);
    }
});

/**
 * POST /api/donations
 * Create new donation
 */
router.post(
    "/",
    authenticate,
    upload.single("image"),
    async (req: AuthRequest, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "Image required" });
            }

            const data = createDonationSchema.parse({
                ...req.body,
                quantity: parseInt(req.body.quantity),
                expiryTimestamp: parseInt(req.body.expiryTimestamp),
                freshnessScore: parseInt(req.body.freshnessScore),
            });

            // Upload image to IPFS
            const ipfsUpload = await ipfsService.uploadFile(req.file);

            // Upload metadata to IPFS
            const metadata = {
                foodType: data.foodType,
                quantity: data.quantity,
                location: data.location,
                freshnessScore: data.freshnessScore,
                image: ipfsUpload.ipfsHash,
                timestamp: Date.now(),
            };

            const metadataUpload = await ipfsService.uploadJSON(metadata);

            // Create donation in database
            const donation = await prisma.donation.create({
                data: {
                    donorId: req.user!.id,
                    foodType: data.foodType,
                    quantity: data.quantity,
                    ipfsHash: metadataUpload.ipfsHash,
                    expiryTimestamp: new Date(data.expiryTimestamp * 1000),
                    location: data.location,
                    freshnessScore: data.freshnessScore,
                    donationId: 0, // Will be updated after blockchain transaction
                    status: "ACTIVE",
                },
            });

            // TODO: Create on-chain donation (requires user's private key or wallet signature)
            // For now, return the donation with instructions

            // Emit WebSocket event
            io.emit("donation:pending", {
                id: donation.id,
                donor: req.user!.walletAddress,
                foodType: data.foodType,
            });

            res.status(201).json({
                donation,
                ipfsUrl: ipfsUpload.url,
                metadataUrl: metadataUpload.url,
                message: "Donation created. Complete blockchain transaction to activate.",
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/donations
 * List donations with filters
 */
router.get("/", async (req, res, next) => {
    try {
        const { status, donorAddress, limit = "20", offset = "0" } = req.query;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (donorAddress) {
            const donor = await prisma.user.findUnique({
                where: { walletAddress: donorAddress as string },
            });

            if (donor) {
                where.donorId = donor.id;
            }
        }

        const donations = await prisma.donation.findMany({
            where,
            include: {
                donor: {
                    select: {
                        walletAddress: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: parseInt(limit as string),
            skip: parseInt(offset as string),
        });

        const total = await prisma.donation.count({ where });

        res.json({
            donations,
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/donations/:id
 * Get donation details
 */
router.get("/:id", async (req, res, next) => {
    try {
        const donation = await prisma.donation.findUnique({
            where: { id: req.params.id },
            include: {
                donor: {
                    select: {
                        walletAddress: true,
                        name: true,
                    },
                },
                match: {
                    include: {
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
                    },
                },
            },
        });

        if (!donation) {
            return res.status(404).json({ error: "Donation not found" });
        }

        res.json(donation);
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/donations/:id/cancel
 * Cancel donation
 */
router.patch("/:id/cancel", authenticate, async (req: AuthRequest, res, next) => {
    try {
        const donation = await prisma.donation.findUnique({
            where: { id: req.params.id },
        });

        if (!donation) {
            return res.status(404).json({ error: "Donation not found" });
        }

        if (donation.donorId !== req.user!.id) {
            return res.status(403).json({ error: "Not authorized" });
        }

        if (donation.status !== "ACTIVE") {
            return res.status(400).json({ error: "Can only cancel active donations" });
        }

        const updated = await prisma.donation.update({
            where: { id: req.params.id },
            data: { status: "CANCELLED" },
        });

        io.emit("donation:cancelled", { id: updated.id });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

export default router;
