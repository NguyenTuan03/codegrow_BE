const { USER_ROLES } = require("../configs/user.config")
const { NotFoundRequestError, BadRequestError } = require("../core/responses/error.response")
const courseModel = require("../models/course.model")
const enrollCourseModel = require('../models/enroll.model')
const userModel = require("../models/user.model")
const { getAllUsers } = require("../repositories/user.repo")
const bcrypt = require('bcrypt')
class UserService {
    static getAllUser = async({limit, sort, page, filter, select}) => {
        return await getAllUsers({limit, sort, page, filter, select})
    }
    static getUserById = async({id}) => {
        const user = await userModel.findOne({_id:id}).populate({
            path:'enrolledCourses',
            select: 'title description price author category'
        })
        if (!user) {
            throw new NotFoundRequestError('User not found')
        }
        return user
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
}
module.exports = UserService