const quizzModel = require("../models/quizz.model");

const getAllQuizzes = async ({ limit, sort, page, filter, select,expand }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const populateOptions = {
        lesson: {
            path: 'lesson',
            select: 'title videokey content'
        },        
    }
    const populateFields = expand
    ? expand
      .split(" ")
      .map((field) => populateOptions[field])
      .filter(Boolean)
    : [];
    const quizzes = await quizzModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .populate(populateFields)
        
    const totalCourses = await quizzModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / limit);
    return {
        quizzes,
        page: page,
        totalPages: totalPages,
    };
}
module.exports = {
    getAllQuizzes    
}