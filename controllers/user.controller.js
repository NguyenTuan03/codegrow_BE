const { FILTER_USER, SELECT_USER } = require("../configs/user.config")
const { OK, CREATED, DELETED } = require("../core/responses/success.response")
const UserService = require("../services/user.service")

class UserController {
    getAllUsers = async (req,res) => {
        new OK({
            message:'Get all users successfully',
            metadata: await UserService.getAllUser({
                limit: req.query.limit || 1000,
                sort: req.query.sort || 'ctime',
                page: req.query.page || 1,
                filter: req.query.filter ? JSON.parse(req.query.filter) : FILTER_USER.AVAILABLE_USER, 
                select: req.query.select || SELECT_USER.DEFAULT
            })
        }).send(res)
    }
    getUserById = async (req,res) => {
        new OK({
            message:'Get user successfully',
            metadata: await UserService.getUserById(req.params)
        }).send(res)
    }
    createUser = async (req,res) => {
        new CREATED({
            message: 'Create user successfully',
            metadata: await UserService.createUser(req.body)
        }).send(res)
    }
    updateUser = async (req,res) => {
        new OK({
            message: 'Update user successfully',
            metadata: await UserService.updateUser({
                id: req.params.id,
                ...req.body
            })
        }).send(res)
    }
    deleteUser = async (req,res) => {
        new DELETED({
            message: 'Delete user successfully',
            metadata: await UserService.deleteUser(req.params)
        }).send(res)
    }
    enrollCourse = async (req,res) => {        
        new CREATED({
            message: 'Enrollment successfully',
            metadata: await UserService.enrollCourse({
                id: req.userId,
                courseId: req.body.courseId})
        }).send(res)
    }
}
module.exports = new UserController()