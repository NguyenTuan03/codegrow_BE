const mongoose = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const QAQCReviewSchema = new mongoose.Schema({
    mentor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    qaqc: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    ...isDeleteSchema.obj
});

module.exports = mongoose.model("QAQCReview", QAQCReviewSchema);
