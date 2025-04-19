const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const LessonSChema = new mongoose.Schema({
    course: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        require:true
    },
    title: {
        type:String,
        required: true
    },
    videoKey: {
        type: String,        
    },
    videoUrl: {
        type:String
    },
    content: {
        type:String,
    },
    order: {
        type:Number,
        required:true
    },
    quiz: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Quiz'
    }],
    ...isDeleteSchema.obj
}, {
    timestamps:true
})
module.exports = mongoose.model('Lesson',LessonSChema)