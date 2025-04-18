const { SELECT_USER, SELECT_COURSE } = require("../configs/user.config");
const ClassroomModel = require("../models/Classroom.model");

const getAllClasses = async ({ limit, sort, page, filter, select,expand }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const populateOptions = {
            mentor: {
                path: 'mentor',
                select: SELECT_USER.DEFAULT
            },
            course: {
                path: 'course',
                select: SELECT_COURSE.FULL
            },
            students: {
                path: 'students',
                select: SELECT_USER.DEFAULT
            }
        }
        const populateFields = expand
        ? expand
          .split(" ")
          .map((field) => populateOptions[field])
          .filter(Boolean)
        : [];
    const classes = await ClassroomModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)  
        .populate(populateFields)      

    const totalClasses = await ClassroomModel.countDocuments(filter);
    const totalPages = Math.ceil(totalClasses / limit);
    return {
        classes,
        page:Number(page),
        totalPages: totalPages,
    };
}
module.exports = {
    getAllClasses    
}