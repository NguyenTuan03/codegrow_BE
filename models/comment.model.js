const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const CommentSchema = new mongoose.Schema(
    {
        course: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Course", 
            required: true 
        },
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },
        rating: { 
            type: Number, 
            min: 1, 
            max: 5,          
        },
        parentComment: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Comment", 
            default: null 
        },
        ...isDeleteSchema.obj
    },
    { timestamps: true, collection: "comments" }
);

module.exports = mongoose.model("Comment", CommentSchema);