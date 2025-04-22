const { SELECT_COURSE, SELECT_USER } = require("../configs/user.config");
const responseModel = require("../models/response.model");

const getAllTickets = async ({ limit, sort, page, filter, select,expand }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const populateOptions = {
        sender: {
            path: 'sender',
            select: SELECT_USER.DEFAULT
        },
        recipient: {
            path: 'recipient',
            select:SELECT_USER.DEFAULT
        },
        course: {
            path: 'course',
            select: SELECT_COURSE.DEFAULT
        },
        repliedBy: {
            path: 'repliedBy',
            select:SELECT_USER.DEFAULT
        }
    }
    const populateFields = expand
    ? expand
      .split(" ")
      .map((field) => populateOptions[field])
      .filter(Boolean)
    : [];
    const tickets = await responseModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .populate(populateFields)
        
    const totalCourses = await responseModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);
    return {
        tickets,
        page: page,
        totalPages: totalPages,
    };
}
module.exports = {
    getAllTickets    
}