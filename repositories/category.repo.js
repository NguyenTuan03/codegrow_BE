const categoryModel = require('../models/category.model')
const getAll = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const categories = await categoryModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .lean();
    const totalCategories = await categoryModel.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limit);
    return {
        categories,
        page: page,
        totalPages: totalPages,
    };
}
module.exports = {
    getAll
}