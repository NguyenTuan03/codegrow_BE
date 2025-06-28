const { default: mongoose } = require("mongoose");
const { SELECT_COURSE, SELECT_USER } = require("../configs/user.config");
const postModel = require("../models/post.model");

const getAllPosts = async ({ limit, sort, page, filter, select, expand }) => {
    const skip = (page - 1) * limit;
    const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
    if (filter.classroom && typeof filter.classroom === "string") {
        filter.classroom = new mongoose.Types.ObjectId(filter.classroom);
    }
    const populateOptions = {
        classroom: {
            path: "classroom",
            select: "title description",
        },
        author: {
            path: "author",
            select: SELECT_USER.DEFAULT,
        },
    };
    const populateFields = expand
        ? expand
              .split(" ")
              .map((field) => populateOptions[field])
              .filter(Boolean)
        : [];
    const posts = await postModel
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(select)
        .populate(populateFields)
        .lean();

    const totalPosts = await postModel.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limit);
    return {
        posts,
        page: page,
        totalPages: totalPages,
    };
};
module.exports = {
    getAllPosts,
};
