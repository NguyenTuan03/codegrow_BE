const mongoose = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const CourseSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    price: { 
        type: Number, 
        default: 0 
    },
    mentor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    category: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },
    ...isDeleteSchema.obj
});

module.exports = mongoose.model("Course", CourseSchema);