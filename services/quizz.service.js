const { BadRequestError, NotFoundRequestError } = require("../core/responses/error.response");
const quizzModel = require("../models/quizz.model");
const ivm = require('isolated-vm');
const submissionModel = require("../models/submission.model");
const { getAllQuizzes } = require("../repositories/quizz.repo");
class QuizzService{
    static createQuizz = async({
        lesson, 
        type, 
        questionText, 
        options, 
        starterCode, 
        expectedOutput, 
        language, 
        explanation, 
        testCases}) => {
        if (!lesson || !type || !questionText) {
            throw new BadRequestError('Missing required fields');
        }
        const newQuiz = await quizzModel.create({
            lesson,
            type,
            questionText,
            options,
            starterCode,
            expectedOutput,
            language,
            explanation,
            testCases
        });
        return newQuiz
    }
    static submitCode = async({userId,quizId, code}) => {
        const quiz = await quizzModel.findById(quizId);
        if (!quiz || quiz.type !== 'code') throw new BadRequestError('Invalid or non-code quiz');
      
        const results = [];
        for (const test of quiz.testCases) {
          const isolate = new ivm.Isolate({ memoryLimit: 8 });
          const context = await isolate.createContext();
          const jail = context.global;
      
          await jail.set('global', jail.derefInto());
      
          try {
            const script = await isolate.compileScript(`
              ${code}
              if (typeof add !== 'function') throw new Error('Function add not found');
              add(${test.input});
            `);
      
            const result = await script.run(context, { timeout: 1000 });
            const output = result?.toString();
      
            results.push({
              input: test.input,
              expected: test.expectedOutput,
              output,
              passed: output === test.expectedOutput
            });
          } catch (err) {
            results.push({
              input: test.input,
              error: err.message,
              passed: false
            });
          }
        }
        const isPassedAll = results.every(r => r.passed);

        await submissionModel.create({
            quiz: quizId,
            user: userId,
            code,
            results,
            isPassed: isPassedAll
        });
        return results
    }
    static submitMultipleChoice = async({ quizId, userId, selectedOption }) => {
        const quiz = await quizzModel.findById(quizId);
        if (!quiz || quiz.type !== 'multiple_choice') {
          throw new BadRequestError('Invalid or non-multiple choice quiz');
        }
        
        const correct = quiz.options.find(opt => opt.isCorrect)?.text;
      
        const passed = selectedOption === correct;
      
        await submissionModel.create({
          quiz: quizId,
          user: userId,
          selectedOption,
          isPassed: passed,
          correctOption: correct
        });
      
        return {
          passed,
          correctOption: correct
        };    
    }
    static updateQuiz = async({id,updates}) => {
      const quiz = await quizzModel.findById(id);
      if (!quiz) throw new BadRequestError('Quiz not found');

      if (quiz.type === 'multiple_choice') {        
        const allowedFields = ['questionText', 'options', 'explanation'];
        Object.keys(updates).forEach(field => {
          if (!allowedFields.includes(field)) delete updates[field];
        });
      }

      if (quiz.type === 'code') {        
        const allowedFields = ['questionText', 'starterCode', 'testCases', 'explanation', 'language'];
        Object.keys(updates).forEach(field => {
          if (!allowedFields.includes(field)) delete updates[field];
        });
      }
      const updated = await quizzModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      return updated
    }
    static deleteQuizz = async({id}) => {
      const quiz = await quizzModel.findByIdAndUpdate(id, 
        { isDeleted: true }, 
        { new: true }
      );
      if (!quiz) throw new BadRequestError('Quiz not found');
    }
    static getSubmission = async({userId}) => {
      const submissions = await submissionModel.find({ user: userId }).sort({ createdAt: -1 });
      if (!submissions) throw new BadRequestError('This user do not submit anything')
      return submissions
    }    
    static getAllQuizzes = async({id}) => {
        const quizzes = await quizzModel.find({
           lesson: id,
           isDeleted:false
        }).sort({ order: 1 });        
                
        if (!quizzes) throw new BadRequestError('Do not have any quizzes in this lesson')
        return quizzes
    }
    static getQuizzById = async({id}) => {
            const quizz = await quizzModel
                .findById(id)
                .populate([
                    {
                        path: 'lesson',
                        select: 'title videokey content'
                    }
                ])
                .lean()
            if (!quizz) throw new NotFoundRequestError('quizz not found')
            return quizz;
    }
}
module.exports = QuizzService