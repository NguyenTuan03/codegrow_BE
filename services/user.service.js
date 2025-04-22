const { USER_ROLES, SELECT_USER } = require("../configs/user.config")
const { NotFoundRequestError, BadRequestError } = require("../core/responses/error.response")
const courseModel = require("../models/course.model")
const enrollModel = require("../models/enroll.model")
const enrollCourseModel = require('../models/enroll.model')
const lessonModel = require("../models/lesson.model")
const userModel = require("../models/user.model")
const userProgressModel = require("../models/user.process.model")
const { getAllUsers } = require("../repositories/user.repo")
const bcrypt = require('bcrypt')
class UserService {
    static getAllUser = async({limit, sort, page, filter, select}) => {
        return await getAllUsers({limit, sort, page, filter, select})
    }
    static getUserById = async({id}) => {
        const user = await userModel.findOne({_id:id}).populate({
            path:'enrolledCourses',
            select: 'title description price author category',
            populate: {
                path: 'category',
                select: 'name'
            }
        })
        if (!user) {
            throw new NotFoundRequestError('User not found')
        }
        return user
    }
    static getConsultedUser = async() => {
        const enroll = await enrollModel.find({
            isConsulted:false
        }).populate([
            {
                path:'user',
                select:SELECT_USER.DEFAULT
            }
        ])
        return enroll
    }
    static createUser = async({ fullName, email,password, role }) => {
        const user = await userModel.findOne({email}).lean()
        if (user) {
            throw new BadRequestError('Email already exist')
        }
        const hashPass = await bcrypt.hash(
            password,
            parseInt(process.env.PASSWORD_SALT)
        )
        await userModel.create({
            fullName,
            role: role || USER_ROLES.USER,
            wallet:0,
            email,
            password:hashPass,
            isVerified: true
        })
        return;
    }
    static updateUser = async({ id, fullName, email, role }) => {
        const user = await userModel.findById(id).lean()
        if (!user) {
            throw new NotFoundRequestError('User not found')
        }
        await userModel.updateOne({_id:id}, {
            fullName: fullName || user.fullName,
            email: email || user.email,
            role: role || user.role
        })
        return;
    }
    static deleteUser = async ({id}) => {
        const user = await userModel.findOne({
            _id:id,
            isDeleted: false
        }).lean()
        if (!user) {
            throw new NotFoundRequestError('User not found')
        }
        await userModel.updateOne(
            {_id:id},
            {isDeleted: true}
        )
        return user
    }
    static enrollCourse = async ({id, courseId}) => {                
        if (!courseId) throw new BadRequestError('CourseId is required')
        const course = await courseModel.findById(courseId)
        if (!course) throw new BadRequestError('Course not found')
        
        const alreadyEnrolled = await enrollCourseModel.findOne({
            user: id,
            course: courseId
        })
        if (alreadyEnrolled) throw new BadRequestError('You already enroll this course')
            
        const user = await userModel.findById(id);
        if (!user) throw new BadRequestError('You already enroll this course')

        if (user.wallet < course.price) throw new BadRequestError('Insufficient balance to enroll in this course')
                
        user.wallet -= course.price
        user.enrolledCourses.push(courseId)
        await user.save()

        await courseModel.findByIdAndUpdate(courseId,{
            $inc: {
                enrolledCount: 1
            }
        })

        const enrollMent = await enrollCourseModel.create({
            user: id,
            course: courseId
        })

        return enrollMent;
    }
    static enrollClass = async({id,fullName, email, phone, city, note}) => {
        if (!fullName || !email || !phone || !city || !note) throw new BadRequestError('All fields are required')
        const alreadyConsulted = await enrollCourseModel.findById(id)
        if (alreadyConsulted) throw new BadRequestError('You have sent the consultant request!')            
        const enrollMent = await enrollCourseModel.create({
            user:id,
            fullName,
            email,
            phone,
            note,
            isConsulted: false
        })
        return enrollMent
    }
    static lessonComplete = async({id,lessonId, courseId}) => {
        const progress = await userProgressModel.findOneAndUpdate(
            {
                user:id,
                course:courseId
            },
            {
                $addToSet: { completedLessons: lessonId },
                $set: { lastLesson: lessonId, updatedAt: new Date() }
            },
            { new: true, upsert: true }
        )
        return progress;
    }
    static markQuizComplete = async({id,quizId, courseId}) => {
        const progress = await userProgressModel.findOneAndUpdate(
            { user: id, course: courseId },
            {
              $addToSet: { completedQuizzes: quizId },
              $set: { updatedAt: new Date() }
            },
            { new: true, upsert: true }
        );
        return progress
    }
    static getUserProgress = async({id,courseId}) => {
        const progress = await userProgressModel.findOne({ user: id, course: courseId });
        const totalLessons = await lessonModel.countDocuments({ course: courseId });
        const completedCount = progress?.completedLessons?.length || 0;
        const percent = totalLessons > 0 ? Math.floor((completedCount / totalLessons) * 100) : 0;
        return {
            completedLessons: progress?.completedLessons || [],
            completedQuizzes: progress?.completedQuizzes || [],
            lastLesson: progress?.lastLesson || null,
            progress: percent
        }
    }
}
module.exports = UserService