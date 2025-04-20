const { FILTER_USER, SELECT_COURSE } = require('../configs/user.config')
const { OK, CREATED, DELETED } = require('../core/responses/success.response')
const CourseService = require('../services/course.service')
class CourseController {
    getAllCourses = async (req,res) => {
        new OK({
            message:'Get all courses successfully',
            metadata: await CourseService.getAllCourse({
                limit: req.query.limit || 1000,
                sort: req.query.sort || 'ctime',
                page: req.query.page || 1,
                filter: req.query.filter ? JSON.parse(req.query.filter) : FILTER_USER.AVAILABLE_USER, 
                select: req.query.select || SELECT_COURSE.FULL,
                expand: req.query.expand || ''
            })
        }).send(res)
    }
    getCourseById = async (req,res) => {
        new OK({
            message:'Get course successfully',
            metadata: await CourseService.getCourseById(req.params)
        }).send(res)
    }
    createCourse = async (req,res) => {
        new CREATED({
            message: 'Create course successfully',
            metadata: await CourseService.createCourse(req.body)
        }).send(res)
    }
    updateCourse = async (req,res) => {
        new OK({
            message: 'Update course successfully',
            metadata: await CourseService.updateCourse({
                id: req.params.id,
                ...req.body
            })
        }).send(res)   
    }
    deleteCourse = async (req,res) => {
        new DELETED({
            message: 'Delete course successfully',
            metadata: await CourseService.deleteCourse(req.params)
        }).send(res)
    }    
    getStudentsEnrolled = async(req,res) => {
        new OK({
            message:'Get students of course successfully',
            metadata: await CourseService.getStudentsEnrolled(req.params)
        }).send(res)
    }
    getLessonsByCourse = async(req,res) => {
        new OK({
            message:'Get lesson by course successfully',
            metadata: await CourseService.getLessonsByCourse(req.params)
        }).send(res)
    }

}
module.exports = new CourseController()