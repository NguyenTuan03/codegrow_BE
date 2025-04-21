const { FILTER_USER } = require("../configs/user.config")
const { CREATED, OK, DELETED } = require("../core/responses/success.response")
const QuizzService = require('../services/quizz.service')
class quizzController {
    createQuizz = async (req,res) => {
        new CREATED({
            message: 'Create quizz successfully',
            metadata: await QuizzService.createQuizz(req.body)
        }).send(res)
    }
    submitCode = async (req,res) => {
        new CREATED({
            message: 'Submit code successfully',
            metadata: await QuizzService.submitCode(req.body)
        }).send(res)
    } 
    updateQuiz = async (req,res) => {
        new OK({
            message: 'Update quizz successfully',
            metadata: await QuizzService.updateQuiz({
                id: req.params.id,
                updates: req.body
            })
        }).send(res)  
    }
    deleteQuizz = async(req,res) => {
        new DELETED({
            message: 'Delete quizz successfully',
            metadata: await QuizzService.deleteQuizz(req.params)
        }).send(res)
    }
    getSubmission = async(req,res) => {
        new OK({
            message: 'get submission successfully',
            metadata: await QuizzService.getSubmission({
                userId: req.userId,                
            })
        }).send(res) 
    }
    getAllQuizzes = async (req,res) => {
        new OK({
            message:'Get quizzes by lesson successfully',
            metadata: await QuizzService.getAllQuizzes(req.params)
        }).send(res)
    }
    getQuizzById = async (req,res) => {
            new OK({
                message:'Get quizz successfully',
                metadata: await QuizzService.getQuizzById(req.params)
            }).send(res)
        }
}
module.exports = new quizzController()