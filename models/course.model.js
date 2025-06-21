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
    enrolledCount: {
        type:Number,
        default:0
    },
    author: { 
        type: String
    },
    category: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref:'Category'
    },
    createdAt: { 
        type: Date,
        default: Date.now
    },
    imgUrl: {
        type: String
    },
    ...isDeleteSchema.obj
});

module.exports = mongoose.model("Course", CourseSchema);