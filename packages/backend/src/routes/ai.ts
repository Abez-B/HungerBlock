import { Router } from "express";
import multer from "multer";
import axios from "axios";
import { authenticate } from "../middleware/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5000";

/**
 * POST /api/ai/classify
 * Classify food type from image
 */
router.post(
    "/classify",
    authenticate,
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "Image required" });
            }

            const formData = new FormData();
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
            formData.append("image", blob, req.file.originalname);

            const response = await axios.post(`${AI_SERVICE_URL}/classify`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            res.json(response.data);
        } catch (error: any) {
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            next(error);
        }
    }
);

/**
 * POST /api/ai/freshness
 * Detect food freshness from image
 */
router.post(
    "/freshness",
    authenticate,
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "Image required" });
            }

            const formData = new FormData();
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
            formData.append("image", blob, req.file.originalname);

            const response = await axios.post(`${AI_SERVICE_URL}/freshness`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            res.json(response.data);
        } catch (error: any) {
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            next(error);
        }
    }
);

export default router;
