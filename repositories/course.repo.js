const courseModel = require("../models/course.model");

const getAllCourses = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const courses = await courseModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .lean();
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