const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");
const { COLLECTION } = require("../configs/user.config");
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            minLength: 5,
            maxLength: 100,
        },
        avatar: {
            type: String,
        },
        role: {
            type: String,
            enum: ["admin", "customer", "qaqc", "mentor"],
            default: "customer",
        },
        email: {
            type: String,
            unique: true,
            trim: true,
        },
        enrollCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],
        password: {
            type: String,
            rquired: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        ...isDeleteSchema.obj,
    },
    {
        timestamps: true,
        collection: COLLECTION.user,
    }
);
module.exports = mongoose.model("User", userSchema);
