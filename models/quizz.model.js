const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const QuestionSchema = new mongoose.Schema({
    lesson: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Lesson" 
    },
    type: {
        type: String,
        enum: ['multiple_choice', 'code'],
        required: true
    },
    questionText: { 
        type: String, 
        required: true 
    },
    options: [{ 
        text: String, 
        isCorrect: Boolean 
    }],

    starterCode: { 
        type: String 
    },
    expectedOutput: { 
        type: String 
    },
    language: { 
        type: String 
    }, 
    testCases: [
        {
            input: { type: String },
            expectedOutput: { type: String }
        }
    ],
    explanation: { 
        type: String 
    },
    ...isDeleteSchema.obj
});
module.exports = mongoose.model('Quizz',QuestionSchema)