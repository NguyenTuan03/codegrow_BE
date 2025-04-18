const {getAllCourses} = require('../repositories/course.repo')
class CourseService {
    static getAllCourse = async({limit, sort, page, filter, select,expand}) => {
        return await getAllCourses({limit, sort, page, filter, select, expand})
    }
    
}
module.exports = CourseService