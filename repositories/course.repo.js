const { SELECT_COURSE, SELECT_USER } = require("../configs/user.config");
const courseModel = require("../models/course.model");

const getAllCourses = async ({ limit, sort, page, filter, select,expand }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const populateOptions = {
        author: {
            path: 'author',
            select: SELECT_USER.DEFAULT
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
        
    const totalCourses = await courseModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);
    return {
        courses,
        page: page,
        totalPages: totalPages,
    };
}
module.exports = {
    getAllCourses    
}