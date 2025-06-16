const { SELECT_COURSE, SELECT_USER } = require("../configs/user.config");
const {
    NotFoundRequestError,
    BadRequestError,
} = require("../core/responses/error.response");
const ClassroomModel = require("../models/Classroom.model");
const CourseModel = require("../models/course.model");
const enrollModel = require("./models/enroll.model.js");
const qaqcreviewModel = require("../models/qaqcreview.model");
const userModel = require("../models/user.model");
const {
    getAllClasses,
    getMentorReviews,
} = require("../repositories/class.repo");
const { s3, createUrlS3, uploadImage } = require("../utils/s3client");
const { v4: uuidv4 } = require("uuid");

class ClassService {
    static getAllClass = async ({
        limit,
        sort,
        page,
        filter,
        select,
        expand,
    }) => {
        return await getAllClasses({
            limit,
            sort,
            page,
            filter,
            select,
            expand,
        });
    };
    static getMentorReviews = async ({ qaqcId }) => {
        return await qaqcreviewModel
            .find({ qaqc: qaqcId })
            .populate("mentor", SELECT_USER.DEFAULT)
            .sort({ createdAt: -1 });
    };
    static getClassById = async ({ id }) => {
        const classroom = await ClassroomModel.findOne({ _id: id })
            .populate([
                {
                    path: "mentor",
                    select: SELECT_USER.DEFAULT,
                },
                {
                    path: "course",
                    select: SELECT_COURSE.FULL,
                },
                {
                    path: "students",
                    select: SELECT_USER.DEFAULT,
                },
            ])
            .lean();
        if (!classroom) throw new NotFoundRequestError("Classroom not found");
        return classroom;
    };
    static getReviewById = async ({ id }) => {
        return await qaqcreviewModel
            .find({ mentor: id })
            .populate("qaqc", SELECT_USER.DEFAULT)
            .sort({ createdAt: -1 });
    };
    static createClassroom = async ({
        title,
        courseId,
        description,
        maxStudents,
        schedule,
        linkMeet,
        imgUrl,
    }) => {
        const Isclassroom = await ClassroomModel.findOne({ title }).lean();
        if (Isclassroom) throw new BadRequestError("Class already exist");

        const Iscourse = await CourseModel.findById(courseId).lean();
        if (!Iscourse)
            throw new BadRequestError("Do not have this course in the system");
        const parsedMaxStudent = Number(maxStudents);
        if (
            !Number.isInteger(parsedMaxStudent) ||
            parsedMaxStudent <= 0 ||
            parsedMaxStudent > 30
        ) {
            throw new BadRequestError("Class must have 1 to 30 students");
        }

        if (!linkMeet) throw new BadRequestError("Please provide link meet");

        const { startDate, endDate, daysOfWeek, time } = schedule || {};
        if (
            !startDate ||
            !endDate ||
            new Date(startDate) >= new Date(endDate)
        ) {
            throw new BadRequestError("Invalid start and end date");
        }

        if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
            throw new BadRequestError(
                "Schedule must include at least one day of the week"
            );
        }

        if (!time || typeof time !== "string") {
            throw new BadRequestError(
                "Schedule time is required and must be a string"
            );
        }
        if (!imgUrl || !imgUrl.originalname) {
            throw new Error("Avatar file is missing or invalid");
        }
        if (imgUrl && imgUrl.buffer && imgUrl.mimetype) {
            const key = `classrooms/${uuidv4()}-${imgUrl.originalname}`;
            const command = uploadImage({
                key: key,
                body: imgUrl.buffer,
                fileType: imgUrl.mimetype,
            });
            await s3.send(command);

            imgUrl = createUrlS3(key);
        }
        const newClass = await ClassroomModel.create({
            title,
            course: courseId,
            description,
            maxStudents: parsedMaxStudent,
            schedule,
            linkMeet,
            imgUrl
        });

        return newClass;
    };
    static updateClassroom = async ({
        id,
        title,
        courseId,
        description,
        maxStudents,
        schedule,
        status,
        mentor,
        linkMeet,
        imgUrl
    }) => {
        const existingClass = await ClassroomModel.findById(id);
        if (!existingClass) throw new BadRequestError("Classroom not found");

        if (title && title !== existingClass.title) {
            const titleExists = await ClassroomModel.findOne({ title });
            if (titleExists)
                throw new BadRequestError(
                    "A class with this title already exists"
                );
            existingClass.title = title;
        }

        if (courseId) {
            const courseExists = await CourseModel.findById(courseId);
            if (!courseExists)
                throw new BadRequestError("Course does not exist");
            existingClass.course = courseId;
        }

        if (mentor) {
            const mentorExists = await userModel.findOne({
                _id: mentor,
                role: "mentor",
            });
            if (!mentorExists) throw new BadRequestError("Invalid mentor");
            existingClass.mentor = mentor;
        }
        let parsedMaxStudent = null;
        if (maxStudents !== undefined) {
            parsedMaxStudent = Number(maxStudents);
            if (
                !Number.isInteger(parsedMaxStudent) ||
                parsedMaxStudent <= 0 ||
                parsedMaxStudent > 30
            ) {
                throw new BadRequestError("Class must have 1 to 30 students");
            }
            existingClass.maxStudents = parsedMaxStudent;
        }

        if (schedule) {
            const { startDate, endDate, daysOfWeek, time } = schedule;
            if (
                startDate &&
                endDate &&
                new Date(startDate) >= new Date(endDate)
            ) {
                throw new BadRequestError("Invalid start/end date");
            }
            if (
                daysOfWeek &&
                (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0)
            ) {
                throw new BadRequestError("Invalid days of week");
            }
            if (time && typeof time !== "string") {
                throw new BadRequestError("Invalid time format");
            }
            existingClass.schedule = schedule;
        }

        if (status) {
            const allowedStatuses = [
                "open",
                "assigned",
                "in-progress",
                "completed",
            ];
            if (!allowedStatuses.includes(status)) {
                throw new BadRequestError("Invalid class status");
            }
            existingClass.status = status;
        }

        if (description !== undefined) {
            existingClass.description = description;
        }
        if (linkMeet !== undefined) {
            existingClass.linkMeet = linkMeet;
        }
        if (imgUrl && imgUrl.buffer && imgUrl.mimetype) {
            const key = `courses/${uuidv4()}-${imgUrl.originalname}`;
            const command = uploadImage({
                key: key,
                body: imgUrl.buffer,
                fileType: imgUrl.mimetype,
            });
            await s3.send(command);
            existingClass.imgUrl = createUrlS3(key);
        }
        await existingClass.save();
        return existingClass;
    };
    static deleteClassroom = async ({ id }) => {
        const existingClass = await ClassroomModel.findById(id);
        if (!existingClass) {
            throw new NotFoundError("Classroom not found");
        }

        if (existingClass.isDeleted) {
            throw new BadRequestError("Classroom already deleted");
        }

        existingClass.isDeleted = true;
        await existingClass.save();
    };
    static assignMentor = async ({ mentorId, classId }) => {
        const classroom = await ClassroomModel.findById(classId);
        if (!classroom) throw new NotFoundRequestError("Classroom not found");

        if (classroom.mentor) {
            throw new BadRequestError(
                "This class already has a mentor assigned"
            );
        }
        classroom.mentor = mentorId;
        classroom.status = "assigned";
        await classroom.save();

        return classroom;
    };
    static addStudentsToClass = async ({ userId, id }) => {
        const classroom = await ClassroomModel.findById(id);
        if (!classroom) throw new NotFoundRequestError("Classroom not found");

        const user = await userModel.findOne({
            _id: userId,
            role: "customer",
        });
        if (!user) throw new BadRequestError("User not found or not a student");
        if (!Array.isArray(classroom.students)) {
            classroom.students = [];
        }
        const alreadyAdded = classroom.students.includes(userId);
        if (alreadyAdded)
            throw new BadRequestError("Student already in this class");

        if (
            typeof classroom.maxStudents === "number" &&
            classroom.students.length >= classroom.maxStudents
        ) {
            throw new BadRequestError(
                "Classroom has reached its maximum student capacity"
            );
        }
        const checkEnroll = await enrollModel.findOne({ user: userId });

        if (!checkEnroll) {
            throw new BadRequestError("Enrollment not found for this student");
        }
        console.log("Before save:", checkEnroll);
        checkEnroll.isConsulted = true;
        await checkEnroll.save();
        console.log("After save:", await enrollModel.findById(checkEnroll._id));

        classroom.students.push(userId);
        await classroom.save();

        return classroom;
    };
    static reviewMentor = async ({ qaqcId, mentorId, rating, comment }) => {
        if (!mentorId || !rating || !comment) {
            throw new BadRequestError("Missing required fields");
        }

        const review = await qaqcreviewModel.create({
            mentor: mentorId,
            qaqc: qaqcId,
            rating,
            comment,
        });
        return review;
    };
}
module.exports = ClassService;
