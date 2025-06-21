const { SELECT_USER, SELECT_COURSE } = require("../configs/user.config");
const { BadRequestError } = require("../core/responses/error.response");
const courseModel = require("../models/course.model");
const categoryModel = require("../models/category.model");
const { getAllCourses } = require("../repositories/course.repo");
const lessonModel = require("../models/lesson.model");
const commentModel = require("../models/comment.model");
const { s3, createUrlS3, uploadImage } = require("../utils/s3client");
const { v4: uuidv4 } = require("uuid");
const enrollModel = require("../models/enroll.model");
class CourseService {
    static getAllCourse = async ({
        limit,
        sort,
        page,
        filter,
        select,
        expand,
    }) => {
        return await getAllCourses({
            limit,
            sort,
            page,
            filter,
            select,
            expand,
        });
    };
    static getCourseById = async ({ id }) => {
        const classroom = await courseModel
            .findOne({ _id: id, isDeleted: false })
            .populate([
                {
                    path: "author",
                    select: SELECT_USER.DEFAULT,
                },
                {
                    path: "category",
                    select: "name",
                },
            ])
            .lean();
        if (!classroom) throw new NotFoundRequestError("Course not found");
        return classroom;
    };
    static getCommentsByCourseId = async ({ courseId }) => {
        if (!courseId) throw new BadRequestError("CourseId is required");
        const comments = await commentModel
            .find({
                course: courseId,
            })
            .populate([
                {
                    path: "user",
                    select: SELECT_USER.DEFAULT,
                },
            ]);
        return comments;
    };
    static createCourse = async ({
        imgUrl,
        title,
        description,
        price,
        author,
        category,
    }) => {
        if (!title || !description) {
            throw new BadRequestError(
                "Missing any required fields: title, description"
            );
        }
        const foundcategory = await categoryModel.findById(category);
        if (!foundcategory) throw new BadRequestError("Missing category id");
        const priced = Number(price);
        if (!imgUrl || !imgUrl.originalname) {
            throw new Error("Avatar file is missing or invalid");
        }
        if (imgUrl && imgUrl.buffer && imgUrl.mimetype) {
            const key = `courses/${uuidv4()}-${imgUrl.originalname}`;
            const command = uploadImage({
                key: key,
                body: imgUrl.buffer,
                fileType: imgUrl.mimetype,
            });
            await s3.send(command);

            imgUrl = createUrlS3(key);
        }
        const newCourse = await courseModel.create({
            title,
            description,
            price: priced || 0,
            author,
            category: foundcategory._id,
            imgUrl,
        });
        return newCourse;
    };
    static updateCourse = async ({
        id,
        title,
        description,
        price,
        author,
        category,
        imgUrl,
    }) => {
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = Number(price);
        if (author !== undefined) updateData.author = author;

        if (category !== undefined) {
            const foundCategory = await categoryModel.findById(category);
            if (!foundCategory)
                throw new BadRequestError("Invalid category ID");
            updateData.category = foundCategory._id;
        }
        if (imgUrl && imgUrl.buffer && imgUrl.mimetype) {
            const key = `courses/${uuidv4()}-${imgUrl.originalname}`;
            const command = uploadImage({
                key: key,
                body: imgUrl.buffer,
                fileType: imgUrl.mimetype,
            });
            await s3.send(command);
            updateData.imgUrl = createUrlS3(key);
        }
        const updatedCourse = await courseModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCourse) throw new BadRequestError("Course not found");

        return updatedCourse;
    };
    static deleteCourse = async ({ id }) => {
        const existingCourse = await courseModel.findById(id);
        if (!existingCourse) {
            throw new NotFoundError("Course not found");
        }

        if (existingCourse.isDeleted) {
            throw new BadRequestError("Course already deleted");
        }

        existingCourse.isDeleted = true;
        await existingCourse.save();
    };
    static getStudentsEnrolled = async ({ id }) => {
        if (!id) throw new BadRequestError("CourseId is required");

        const course = await courseModel.findById(id).populate({
            path: "students",
            select: SELECT_USER.DEFAULT,
        });

        if (!course) throw new BadRequestError("Course not found");

        return course.students;
    };
    static getLessonsByCourse = async ({ id }) => {
        const lessons = await lessonModel
            .find({
                course: id,
            })
            .sort({ order: 1 });

        if (!lessons)
            throw new BadRequestError("Do not have any lessons in this course");
        return lessons;
    };
    static createComment = async ({
        id,
        userId,
        comment,
        rating,
        parentComment,
    }) => {
        if (!comment) throw new BadRequestError("Comment is required");
        const course = await courseModel.findById(id);
        if (!course) throw new BadRequestError("Course not found");
        const newComment = await commentModel.create({
            course: id,
            user: userId,
            content: comment,
            rating,
            parentComment: parentComment || null,
        });
        return newComment;
    };
}
module.exports = CourseService;
