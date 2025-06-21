const { SELECT_USER } = require("../configs/user.config");
const enrollModel = require("../models/enroll.model");

const getAllEnrollment = async ({ limit, sort, page, filter, select,expand }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const populateOptions = {
        user: {
            path: 'user',
            select: SELECT_USER.DEFAULT
        },
        classroom: {
            path: 'classroom',
            select: 'title category'
        }
    }
    const populateFields = expand
    ? expand
      .split(" ")
      .map((field) => populateOptions[field])
      .filter(Boolean)
    : [];
    const enrolls = await enrollModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .populate(populateFields)
        
    const totalEnrolls = await enrollModel.countDocuments(filter);
    const totalPages = Math.ceil(totalEnrolls / limit);
    return {
        enrolls,
        page: page,
        totalPages: totalPages,
    };
}
module.exports = {
    getAllEnrollment    
}