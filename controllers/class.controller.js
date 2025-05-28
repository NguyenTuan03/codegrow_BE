const { FILTER_USER, SELECT_CLASS } = require("../configs/user.config");
const { OK, CREATED, DELETED } = require("../core/responses/success.response");
const ClassService = require("../services/class.service");
class ClassroomController {
    getAllClasses = async (req, res) => {
        new OK({
            message: "Get all classes successfully",
            metadata: await ClassService.getAllClass({
                limit: req.query.limit || 1000,
                sort: req.query.sort || "ctime",
                page: req.query.page || 1,
                filter: req.query.filter
                    ? JSON.parse(req.query.filter)
                    : FILTER_USER.AVAILABLE_USER,
                select: req.query.select || SELECT_CLASS.DEFAULT,
                expand: req.query.expand || "",
            }),
        }).send(res);
    };
    getMentorReviews = async (req, res) => {
        new OK({
            message: "Get all mentors review successfully",
            metadata: await ClassService.getMentorReviews({
                qaqcId: req.userId,
            }),
        }).send(res);
    };
    getReviewById = async (req, res) => {
        new OK({
            message: "Get review successfully",
            metadata: await ClassService.getReviewById(req.params),
        }).send(res);
    };
    getClassById = async (req, res) => {
        new OK({
            message: "Get class successfully",
            metadata: await ClassService.getClassById(req.params),
        }).send(res);
    };
    createClassroom = async (req, res) => {
        new CREATED({
            message: "Create classroom successfully",
            metadata: await ClassService.createClassroom({
                title: req.body.title,
                courseId: req.body.courseId,
                description: req.body.description,
                maxStudents: req.body.maxStudents,
                schedule: req.body.schedule,
                linkMeet: req.body.linkMeet,
                imgUrl: req.file,
            }),
        }).send(res);
    };
    updateClassroom = async (req, res) => {
        new OK({
            message: "Update classroom successfully",
            metadata: await ClassService.updateClassroom({
                id: req.params.id,
                title: req.body.title,
                courseId: req.body.courseId,
                description: req.body.description,
                maxStudents: req.body.maxStudents,
                schedule: req.body.schedule,
                status: req.body.status,
                mentor: req.body.mentor,
                imgUrl: req.file
            }),
        }).send(res);
    };
    deleteClassroom = async (req, res) => {
        new DELETED({
            message: "Delete classroom successfully",
            metadata: await ClassService.deleteClassroom(req.params),
        }).send(res);
    };
    assignMentor = async (req, res) => {
        new OK({
            message: "You have successfully taken this class",
            metadata: await ClassService.assignMentor({
                mentorId: req.userId,
                classId: req.params.id,
            }),
        }).send(res);
    };
    addStudentsToClass = async (req, res) => {
        new OK({
            message: "Student added to classroom successfully",
            metadata: await ClassService.addStudentsToClass({
                userId: req.body.userId,
                id: req.params.id,
            }),
        }).send(res);
    };
    reviewMentor = async (req, res) => {
        new CREATED({
            message: "Review mentor successfully",
            metadata: await ClassService.reviewMentor({
                qaqcId: req.userId,
                ...req.body,
            }),
        }).send(res);
    };
}
module.exports = new ClassroomController();
