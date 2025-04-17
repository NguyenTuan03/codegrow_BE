const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const ClassSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Course", 
        required: true 
    },
    description: { 
        type: String 
    },
    mentor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        default: null 
    }, 
    status: { 
        type: String, 
        enum: ['open', 'assigned', 'in-progress', 'completed'], 
        default: 'open' 
    },
    maxStudents: { 
        type: Number, 
        default: 30 
    },
    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        default:[]
    }],
    schedule: {
        startDate: { type: Date },
        endDate: { type: Date },
        daysOfWeek: [{ type: String }], 
        time: { type: String } 
    },
    ...isDeleteSchema.obj
}, { timestamps: true });
module.exports = mongoose.model('Classroom',ClassSchema)