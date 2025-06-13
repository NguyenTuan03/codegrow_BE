const { CREATED, OK } = require("../core/responses/success.response");
const LessonService = require("../services/lesson.service");

class lessonController {
    createLesson = async (req, res) => {
        new CREATED({
            message: "Create a lesson successfully",
            metadata: await LessonService.createLesson({
                course: req.body.course,
                title: req.body.title,
                content: req.body.content,
                order: req.body.order,
                quiz: req.body.quiz,
                 free_url: req.body.free_url,
                video: req.file,
            }),
        }).send(res);
    };
    getLessonById = async (req, res) => {
        new OK({
            message: "Get lesson by Id successfully",
            metadata: await LessonService.getLessonById(req.params),
        }).send(res);
    };
    uploadVideo = async (req, res) => {
        new CREATED({
            message: "Upload a video successfully",
            metadata: await LessonService.uploadVideo(req.body),
        }).send(res);
    };
    reviewLesson = async (req, res) => {
        new OK({
            message: "Lesson reviewed successfully",
            metadata: await LessonService.reviewLesson({
                id: req.params.id,
                reviewerId: req.userId,
                ...req.body,
            }),
        }).send(res);
    };
}
module.exports = new lessonController();
