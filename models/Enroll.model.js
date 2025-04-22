const mongoose = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const EnrollmentSchema = new mongoose.Schema({
     user: {
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User", required: true 
     },
     course: {
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Course", required: true 
     },
     progress: {
          type: Number, 
          default: 0 
     },
     completed: {
          type: Boolean, 
          default: false 
     },
     enrolledAt: {
          type: Date, 
          default: Date.now 
     },
     fullName: { 
          type: String 
     },
     email: { 
          type: String 
     },
     phone: { 
          type: String 
     },
     note: { 
          type: String 
     },
     isConsulted: { 
          type: Boolean, 
          default: false 
     },
    ...isDeleteSchema.obj
});

module.exports = mongoose.model("Enrollment", EnrollmentSchema);
