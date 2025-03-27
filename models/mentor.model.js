const mongoose = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const MentorSchema = new mongoose.Schema({
    user: {
         type: mongoose.Schema.Types.ObjectId, 
         ref: "User", required: true 
        },
    expertise: {
        type: [String], 
        required: true 
        },
    rating: {
         type: Number, 
         default: 0 
    },
    bio: {
         type: String 
    },
    courses: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Course" 
    }],
    ...isDeleteSchema.obj
});

module.exports = mongoose.model("Mentor", MentorSchema);
