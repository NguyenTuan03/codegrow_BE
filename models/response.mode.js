const mongoose = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const ResponseSchema = new mongoose.Schema(
    {
        sender: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        recipient: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User"
        },
        course: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Course" 
        },
        message: { 
            type: String, 
            required: true 
        },
        status: { 
            type: String, 
            enum: ["pending", "resolved", "rejected"], 
            default: "pending" 
        },
        qaqcReply: { 
            type: String, 
            default: null 
        },
        ...isDeleteSchema.obj
    },
    { timestamps: true, collection: "responses" }
);

module.exports = mongoose.model("Response", ResponseSchema);