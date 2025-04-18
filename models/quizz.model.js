const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

const QuestionSchema = new mongoose.Schema({
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
    questionText: { type: String, required: true },
    options: [{ text: String, isCorrect: Boolean }],
    explanation: { type: String },
    ...isDeleteSchema.obj
});
module.exports = mongoose.model('Quizz',QuestionSchema)