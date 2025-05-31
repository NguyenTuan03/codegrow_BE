const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const PostSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tags: [{ type: String }],
        attachments: [
            {
                fileName: String,
                fileUrl: String,
                fileType: String,
            },
        ],
        createdAt: { type: Date, default: Date.now },
        ...isDeleteSchema.obj
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Post", PostSchema);
