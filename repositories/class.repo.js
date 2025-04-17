const ClassroomModel = require("../models/Classroom.model");

const getAllClasses = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const classes = await ClassroomModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .lean();
    const totalClasses = await ClassroomModel.countDocuments(filter);
    const totalPages = Math.ceil(totalClasses / limit);
    return {
        classes,
        page: page,
        totalPages: totalPages,
    };
}
module.exports = {
    getAllClasses    
}