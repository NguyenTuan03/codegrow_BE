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
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Classroom"
        },
        title: {
            type:String,
            required: true
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
        replyAt: { 
            type: Date 
        },
        repliedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User' 
        },
        ...isDeleteSchema.obj
    },
    { timestamps: true, collection: "responses" }
);

module.exports = mongoose.model("Response", ResponseSchema);