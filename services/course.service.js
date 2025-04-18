const {getAllCourses} = require('../repositories/course.repo')
class CourseService {
    static getAllCourse = async({limit, sort, page, filter, select}) => {
        return await getAllCourses({limit, sort, page, filter, select})
    }
}
module.exports = CourseService