const { BadRequestError } = require("../core/responses/error.response");
const courseModel = require("../models/course.model");
const lessonModel = require("../models/lesson.model");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { SELECT_COURSE, SELECT_USER } = require("../configs/user.config");
const { createUrlS3, s3, uploadVideo } = require("../utils/s3client");
const { v4: uuidv4 } = require("uuid");
class LessonService {
    static createLesson = async ({
        course,
        title,
        content,
        order,
        quiz,
        free_url,
        video,
    }) => {
        if (!course || !title || order === undefined) {
            throw new BadRequestError(
                "Missing required fields: course, title, order"
            );
        }
        const courseExists = await courseModel.findById(course);
        if (!courseExists) throw new BadRequestError("Course not found");

        const key = `lessons/${Date.now()}-${uuidv4()}-${video.originalname}`;
        const command = uploadVideo({
            key,
            fileType: video.mimetype,
            body: video.buffer,
        });
        await s3.send(command);
        const publicUrl = createUrlS3(key);

        const newLesson = await lessonModel.create({
            course,
            title,
            videoKey: key,
            videoUrl: publicUrl,
            content,
            order,
            quiz,
            free_url
        });
        return newLesson;
    };
    static getLessonById = async ({ id }) => {
        const lesson = await lessonModel
            .findOne({ _id: id })
            .populate([
                {
                    path: "course",
                    select: SELECT_COURSE.FULL,
                },
                {
                    path: "quiz",
                    select: "lesson",
                },
                {
                    path: "reviewedBy",
                    select: SELECT_USER.DEFAULT,
                },
            ])
            .lean();
        if (!lesson) throw new NotFoundRequestError("lesson not found");
        return lesson;
    };
    static uploadVideo = async ({ fileName, fileType }) => {
        const key = `lessons/${Date.now()}-${fileName}`;

        const command = uploadVideo({ key: key, fileType: fileType });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
        return {
            uploadUrl,
            key,
            publicUrl: createUrlS3(key),
        };
    };
    static reviewLesson = async ({ id, reviewerId, status, note, mark }) => {
        if (!["pending", "done"].includes(status)) {
            throw new BadRequestError("Invalid status");
        }
        const lesson = await lessonModel.findByIdAndUpdate(
            id,
            {
                status,
                reviewedBy: reviewerId,
                reviewAt: new Date(),
                reviewNote: note,
                mark,
            },
            { new: true }
        );
        if (!lesson) throw new BadRequestError("Lesson not found");
        return lesson;
    };
}
module.exports = LessonService;
