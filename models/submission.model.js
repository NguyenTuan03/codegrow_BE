const { default: mongoose } = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
    quiz: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Quiz' 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    code: { 
        type: String 
    },
    results: [
      {
        input: String,
        expected: String,
        output: String,
        passed: Boolean,
        error: String
      }
    ],
    isPassed: Boolean
  }, { timestamps: true });
  
  module.exports = mongoose.model('Submission', SubmissionSchema);