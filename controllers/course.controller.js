const { FILTER_USER, SELECT_COURSE } = require('../configs/user.config')
const { OK } = require('../core/responses/success.response')
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
}
module.exports = new CourseController()