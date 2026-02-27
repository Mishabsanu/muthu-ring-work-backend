import Work from "../models/Work.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/AppError.js";
import { successResponse } from "../utils/response.js";

// @desc    Create a new work entry
// @route   POST /api/v1/works
// @access  Private
export const createWork = asyncHandler(async (req, res, next) => {
    const work = await Work.create(req.body);
    return successResponse(res, "Work created successfully", 201, work);
});

// @desc    Get all works (with optional filters)
// @route   GET /api/v1/works
// @access  Private
export const getWorks = asyncHandler(async (req, res, next) => {
    const { workType, startDate, endDate } = req.query;

    let query = {};

    if (workType) {
        query.workType = workType;
    }

    if (startDate || endDate) {
        query.endDate = {};
        if (startDate) query.endDate.$gte = new Date(startDate);
        if (endDate) query.endDate.$lte = new Date(endDate);
    }

    const works = await Work.find(query).sort("-endDate");
    return successResponse(res, "Works fetched successfully", 200, works);
});

// @desc    Get work by ID
// @route   GET /api/v1/works/:id
// @access  Private
export const getWorkById = asyncHandler(async (req, res, next) => {
    const work = await Work.findById(req.params.id);
    if (!work) {
        return next(createError("Work not found", 404));
    }
    return successResponse(res, "Work fetched successfully", 200, work);
});

// @desc    Update a work entry
// @route   PUT /api/v1/works/:id
// @access  Private
export const updateWork = asyncHandler(async (req, res, next) => {
    // We use findById + save to ensure pre('save') middleware runs to recalculate totals
    let work = await Work.findById(req.params.id);

    if (!work) {
        return next(createError("Work not found", 404));
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
        work[key] = req.body[key];
    });

    await work.save();

    return successResponse(res, "Work updated successfully", 200, work);
});

// @desc    Delete a work entry
// @route   DELETE /api/v1/works/:id
// @access  Private
export const deleteWork = asyncHandler(async (req, res, next) => {
    const work = await Work.findByIdAndDelete(req.params.id);
    if (!work) {
        return next(createError("Work not found", 404));
    }
    return successResponse(res, "Work deleted successfully", 200, {});
});

// @desc    Get dashboard summary metrics
// @route   GET /api/v1/works/summary/dashboard
// @access  Private
export const getDashboardSummary = asyncHandler(async (req, res, next) => {
    const works = await Work.find();

    let totalIncome = 0;
    let totalExpense = 0;
    let totalProfit = 0;

    works.forEach(w => {
        totalIncome += w.income || 0;
        totalExpense += w.totalExpense || 0;
        totalProfit += w.profit || 0;
    });

    const recentWorks = await Work.find().sort("-createdAt").limit(5);

    return successResponse(res, "Dashboard summary fetched successfully", 200, {
        totalWorks: works.length,
        totalIncome,
        totalExpense,
        totalProfit,
        recentWorks
    });
});

// @desc    Get report data
// @route   GET /api/v1/works/summary/reports
// @access  Private
export const getReports = asyncHandler(async (req, res, next) => {
    // Aggregate by month for the current year, or provide simple group based on data
    const pipeline = [
        {
            $group: {
                _id: { month: { $month: "$endDate" }, year: { $year: "$endDate" } },
                totalIncome: { $sum: "$income" },
                totalExpense: { $sum: "$totalExpense" },
                totalProfit: { $sum: "$profit" },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ];

    const reportData = await Work.aggregate(pipeline);

    return successResponse(res, "Reports fetched successfully", 200, reportData);
});
