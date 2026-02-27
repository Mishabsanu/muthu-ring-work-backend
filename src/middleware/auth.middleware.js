import { verifyAccessToken } from "../utils/jwt.js";
import { createError } from "../utils/AppError.js";
import Admin from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(createError("Not authorized to access this route", 401));
    }

    try {
        const decoded = verifyAccessToken(token);
        req.admin = await Admin.findById(decoded.id);
        if (!req.admin) {
            return next(createError("Admin not found", 404));
        }
        next();
    } catch (err) {
        return next(createError("Not authorized to access this route", 401));
    }
});
