const { default: mongoose } = require("mongoose");

const userProgressSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course' 
    },
    completedLessons: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lesson' 
    }],
    completedQuizzes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Quizz' 
    }],
    lastLesson: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Lesson' 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
  });
  
  module.exports = mongoose.model('UserProgress', userProgressSchema);