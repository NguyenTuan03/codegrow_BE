const userModel = require("../models/user.model");

const getAllUsers = async ({ limit, sort, page, filter, select }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const users = await userModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .lean();
    const totalUsers = await userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);
    return {
        users,
        page: page,
        totalPages: totalPages,
    };
}
module.exports = {
    getAllUsers    
}