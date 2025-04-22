const { SELECT_COURSE, SELECT_USER } = require("../configs/user.config")
const { NotFoundRequestError, BadRequestError } = require("../core/responses/error.response")
const ClassroomModel = require("../models/Classroom.model")
const CourseModel = require('../models/course.model')
const enrollModel = require("../models/enroll.model")
const userModel = require("../models/user.model")
const { getAllClasses } = require("../repositories/class.repo")

class ClassService {
    static getAllClass = async({limit, sort, page, filter, select, expand}) => {
        return await getAllClasses({limit, sort, page, filter, select, expand})
    }
    static getClassById = async({id}) => {
        const classroom = await ClassroomModel
            .findOne({_id:id})
            .populate([
                {
                    path: 'mentor',
                    select: SELECT_USER.DEFAULT
                },
                {
                    path: 'course',
                    select: SELECT_COURSE.FULL
                },
                {
                    path: 'students',
                    select: SELECT_USER.DEFAULT
                }
            ])
            .lean()
        if (!classroom) throw new NotFoundRequestError('Classroom not found')
        return classroom;
    }
    static createClassroom = async({title, courseId, description,maxStudents, schedule}) => {
        const Isclassroom = await ClassroomModel.findOne({title}).lean();
        if (Isclassroom) throw new BadRequestError('Class already exist')

        const Iscourse = await CourseModel.findById(courseId).lean()
        if (!Iscourse) throw new BadRequestError('Do not have this course in the system')

        if (!Number.isInteger(maxStudents) || maxStudents <= 0 || maxStudents > 30) {
            throw new BadRequestError("Class must have 1 to 30 students");
        }

        const { startDate, endDate, daysOfWeek, time } = schedule || {};
        if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
            throw new BadRequestError("Invalid start and end date");
        }

        if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
            throw new BadRequestError("Schedule must include at least one day of the week");
        }
    
        if (!time || typeof time !== "string") {
            throw new BadRequestError("Schedule time is required and must be a string");
        }
        const newClass = await ClassroomModel.create({
            title,
            course: courseId,
            description,
            maxStudents,
            schedule
        })

        return newClass;
    }
    static updateClassroom = async({id,
        title, 
        courseId, 
        description, 
        maxStudents, 
        schedule, 
        status, 
        mentor }) => {
            
            const existingClass = await ClassroomModel.findById(id);
            if (!existingClass) throw new BadRequestError("Classroom not found");
            
            if (title && title !== existingClass.title) {
                const titleExists = await ClassroomModel.findOne({ title });
                if (titleExists) throw new BadRequestError("A class with this title already exists");
                existingClass.title = title;
            }
            
            if (courseId) {
                const courseExists = await CourseModel.findById(courseId);
                if (!courseExists) throw new BadRequestError("Course does not exist");
                existingClass.course = courseId;
            }
            
            if (mentor) {
                const mentorExists = await userModel.findOne({ _id: mentor, role: "mentor" });
                if (!mentorExists) throw new BadRequestError("Invalid mentor");
                existingClass.mentor = mentor;
            }
            
            if (maxStudents !== undefined) {
                if (!Number.isInteger(maxStudents) || maxStudents <= 0 || maxStudents > 30) {
                    throw new BadRequestError("Class must have 1 to 30 students");
                }
                existingClass.maxStudents = maxStudents;
            }
            
            if (schedule) {
                const { startDate, endDate, daysOfWeek, time } = schedule;
                if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
                    throw new BadRequestError("Invalid start/end date");
                }
                if (daysOfWeek && (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0)) {
                    throw new BadRequestError("Invalid days of week");
                }
                if (time && typeof time !== "string") {
                    throw new BadRequestError("Invalid time format");
                }
                existingClass.schedule = schedule;
            }
            
            if (status) {
                const allowedStatuses = ['open', 'assigned', 'in-progress', 'completed'];
                if (!allowedStatuses.includes(status)) {
                    throw new BadRequestError("Invalid class status");
                }
                existingClass.status = status;
            }
            
            if (description !== undefined) {
                existingClass.description = description;
            }
            await existingClass.save();
            return existingClass;
    }
    static deleteClassroom = async({id}) => {
        const existingClass = await ClassroomModel.findById(id);
        if (!existingClass) {
            throw new NotFoundError("Classroom not found");
        }

        if (existingClass.isDeleted) {
            throw new BadRequestError("Classroom already deleted");
        }
            
        existingClass.isDeleted = true;
        await existingClass.save();
            
    }
    static assignMentor = async({mentorId,classId}) => {
        const classroom = await ClassroomModel.findById(classId)
        if (!classroom) throw new NotFoundRequestError('Classroom not found')

        if (classroom.mentor) {
            throw new BadRequestError('This class already has a mentor assigned')
        }
        classroom.mentor = mentorId
        classroom.status = 'assigned'
        await classroom.save()

        return classroom
    }
    static addStudentsToClass = async({userId,id}) => {
        const classroom = await ClassroomModel.findById(id)
        if (!classroom) throw new NotFoundRequestError('Classroom not found')
        
        const user = await userModel.findOne({
            _id: userId,
            role:'customer'
        })
        if (!user) throw new BadRequestError('User not found or not a student')
        if (!Array.isArray(classroom.students)) {
            classroom.students = [];
        }
        const alreadyAdded = classroom.students.includes(userId)
        if (alreadyAdded) throw new BadRequestError('Student already in this class')

        const checkEnroll = await enrollModel.findById(userId)
        checkEnroll.isConsulted = true
        
        classroom.students.push(userId)
        await classroom.save()

        return classroom;
    }
    
}
module.exports = ClassService