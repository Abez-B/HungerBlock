import { Request, Response, NextFunction } from "express";

export function errorHandler(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error("Error:", error);

    // Prisma errors
    if (error.code?.startsWith("P")) {
        return res.status(400).json({
            error: "Database error",
            message: error.message,
        });
    }

    // Validation errors
    if (error.name === "ZodError") {
        return res.status(400).json({
            error: "Validation error",
            details: error.errors,
        });
    }

    // Default error
    res.status(error.status || 500).json({
        error: error.message || "Internal server error",
    });
}
