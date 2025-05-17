const { SELECT_COURSE, SELECT_USER } = require("../configs/user.config");
const courseModel = require("../models/course.model");
const lessonModel = require("../models/lesson.model");

const getAllCourses = async ({ limit, sort, page, filter, select,expand }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const populateOptions = {
        author: {
            path: 'author',
            select: SELECT_USER.DEFAULT
        },
        category: {
            path: 'category',
            select:'name'
        }
    }
    const populateFields = expand
    ? expand
      .split(" ")
      .map((field) => populateOptions[field])
      .filter(Boolean)
    : [];
    const courses = await courseModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .populate(populateFields)
        .lean()
        
    const courseWithLessonCount = await Promise.all(
        courses.map(async(course) => {
            const count = await lessonModel.countDocuments({course: course._id}).lean()
            return {
                ...course,
                lessons: count
            }
        })
    )
    const totalCourses = await courseModel.countDocuments(filter);    
    const totalPages = Math.ceil(totalCourses / limit);
    console.log(typeof courseWithLessonCount);    
    return {
        courses: courseWithLessonCount,
        page: page,
        totalPages: totalPages,
    };
}
module.exports = {
    getAllCourses    
}