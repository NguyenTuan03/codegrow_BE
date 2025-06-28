const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");
const quizz = require("./quizz.model");
const LessonSChema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            require: true,
        },
        title: {
            type: String,
            required: true,
        },
        videoKey: {
            type: String,
        },
        videoUrl: {
            type: String,
        },
        content: {
            type: String,
        },
        order: {
            type: Number,
            required: true,
        },
        quiz: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Quizz",
            },
        ],
        status: {
            type: String,
            enum: ["pending", "done"],
            default: "pending",
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewAt: {
            type: Date,
        },
        reviewNote: {
            type: String,
        },
        free_url: {
            type: String,
        },
        mark: {
            type: String,
            enum: ["A+", "A", "B", "C", "D"],
        },
        ...isDeleteSchema.obj,
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("Lesson", LessonSChema);
