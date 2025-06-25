const { FILTER_USER, SELECT_USER } = require("../configs/user.config");
const { OK, CREATED, DELETED } = require("../core/responses/success.response");
const UserService = require("../services/user.service");

class UserController {
    getAllUsers = async (req, res) => {
        new OK({
            message: "Get all users successfully",
            metadata: await UserService.getAllUser({
                limit: req.query.limit || 1000,
                sort: req.query.sort || "ctime",
                page: req.query.page || 1,
                filter: req.query.filter
                    ? JSON.parse(req.query.filter)
                    : FILTER_USER.AVAILABLE_USER,
                select: req.query.select || SELECT_USER.DEFAULT,
            }),
        }).send(res);
    };
    getListConsultedUser = async (req, res) => {
        new OK({
            message: "Get list consulting user successfully",
            metadata: await UserService.getConsultedUser(),
        }).send(res);
    };
    getUserById = async (req, res) => {
        new OK({
            message: "Get user successfully",
            metadata: await UserService.getUserById(req.params),
        }).send(res);
    };
    createUser = async (req, res) => {
        new CREATED({
            message: "Create user successfully",
            metadata: await UserService.createUser(req.body),
        }).send(res);
    };
    updateUser = async (req, res) => {
        new OK({
            message: "Update user successfully",
            metadata: await UserService.updateUser({
                id: req.params.id,
                fullName: req.body.fullName,
                email: req.body.email,
                role: req.body.role,
                avatar: req.file,
            }),
        }).send(res);
    };
    deleteUser = async (req, res) => {
        new DELETED({
            message: "Delete user successfully",
            metadata: await UserService.deleteUser(req.params),
        }).send(res);
    };
    enrollCourse = async (req, res) => {
        new CREATED({
            message: "Course enrollment successfully",
            metadata: await UserService.enrollCourse({
                req,
                id: req.userId,
                courseId: req.body.courseId,
            }),
        }).send(res);
    };
    enrollClass = async (req, res) => {
        new CREATED({
            message: "Class enrollment successfully",
            metadata: await UserService.enrollClass({
                id: req.userId,
                ...req.body,
            }),
        }).send(res);
    };
    lessonComplete = async (req, res) => {
        new OK({
            message: "mark lesson progress successfully",
            metadata: await UserService.lessonComplete({
                id: req.userId,
                ...req.body,
            }),
        }).send(res);
    };
    quizzComplete = async (req, res) => {
        new OK({
            message: "mark quizz progress successfully",
            metadata: await UserService.markQuizComplete({
                id: req.userId,
                ...req.body,
            }),
        }).send(res);
    };
    getProgress = async (req, res) => {
        new OK({
            message: "Get user's progress successfully",
            metadata: await UserService.getUserProgress({
                id: req.userId,
                ...req.body
            }),
        }).send(res);
    };
    getCourseInfo = async (req,res) => {
        new OK({
            message: 'response successful',
            metadata: await UserService.getCourseInfo({
                promt: req.body.promt, 
                courseId: req.body.courseId
            })
        }).send(res);
    }
}
module.exports = new UserController();
