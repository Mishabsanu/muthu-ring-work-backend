import Admin from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/AppError.js";
import { successResponse } from "../utils/response.js";
import { signAccessToken } from "../utils/jwt.js";

// @desc    Register admin (For initial setup)
// @route   POST /api/v1/auth/register
// @access  Public
export const registerAdmin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(createError("Please provide email and password", 400));
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        return next(createError("Admin already exists", 400));
    }

    const admin = await Admin.create({
        email,
        password,
    });

    const accessToken = signAccessToken({ id: admin._id, email: admin.email });

    return successResponse(res, "Admin registered successfully", 201, {
        admin: { id: admin._id, email: admin.email },
        accessToken,
    });
});

// @desc    Login Admin
// @route   POST /api/v1/auth/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(createError("Please provide an email and password", 400));
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.matchPassword(password))) {
        return next(createError("Invalid credentials", 401));
    }

    const accessToken = signAccessToken({ id: admin._id, email: admin.email });

    return successResponse(res, "Login successful", 200, {
        admin: { id: admin._id, email: admin.email },
        accessToken,
    });
});
