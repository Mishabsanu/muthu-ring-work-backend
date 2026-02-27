import mongoose from "mongoose";

const workSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: [true, "Please provide customer name"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Please provide location"],
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, "Please provide start date of work"],
            default: Date.now,
        },
        endDate: {
            type: Date,
            required: [true, "Please provide end date of work"],
            default: Date.now,
        },
        workType: {
            type: String,
            enum: ["Ring", "Well"],
            required: [true, "Please specify work type as 'Ring' or 'Well'"],
        },
        // Ring Specific
        ringDetails: [
            {
                size: {
                    type: String,
                    enum: ["2ft", "3ft", "4ft", "5ft"],
                },
                pricePerRing: {
                    type: Number,
                },
                quantity: {
                    type: Number,
                },
            }
        ],
        // Well Specific
        wellDetails: {
            kolCount: {
                type: Number,
            },
            pricePerKol: {
                type: Number,
            },
        },
        // Expenses
        expenses: {
            food: { type: Number, default: 0 },
            worker: { type: Number, default: 0 },
            material: { type: Number, default: 0 },
            other: { type: Number, default: 0 },
        },
        // Auto-calculated fields
        income: {
            type: Number,
            default: 0,
        },
        totalExpense: {
            type: Number,
            default: 0,
        },
        profit: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

workSchema.pre("save", function (next) {
    // Calculate Income
    if (this.workType === "Ring" && Array.isArray(this.ringDetails)) {
        this.income = this.ringDetails.reduce((sum, ring) => {
            return sum + ((ring.pricePerRing || 0) * (ring.quantity || 0));
        }, 0);
    } else if (this.workType === "Well" && this.wellDetails) {
        this.income =
            (this.wellDetails.pricePerKol || 0) * (this.wellDetails.kolCount || 0);
    } else {
        this.income = 0;
    }

    // Calculate Total Expense
    const exs = this.expenses;
    this.totalExpense =
        (exs.food || 0) +
        (exs.worker || 0) +
        (exs.material || 0) +
        (exs.other || 0);

    // Calculate Profit
    this.profit = this.income - this.totalExpense;

    next();
});

const Work = mongoose.model("Work", workSchema);

export default Work;
