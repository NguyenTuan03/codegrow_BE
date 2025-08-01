const { SELECT_COURSE, SELECT_USER } = require("../configs/user.config");
const {
    BadRequestError,
    NotFoundRequestError,
} = require("../core/responses/error.response");
const classroomModel = require("../models/classroom.model");
const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const { getAllPosts } = require("../repositories/post.repo");
const { createUrlS3, s3, uploadImage } = require("../utils/s3client");
const { v4: uuidv4 } = require("uuid");
class PostService {
    static getAllPosts = async ({
        limit,
        sort,
        page,
        filter,
        select,
        expand,
    }) => {
        return await getAllPosts({
            limit,
            sort,
            page,
            filter,
            select,
            expand,
        });
    };
    static createPost = async ({
        title,
        content,
        classId,
        author,
        tags,
        attachments,
    }) => {
        if (!title || !content || !classId) {
            throw new BadRequestError(
                "Missing any required fields: title, content, classId"
            );
        }
        const classExists = await classroomModel.findById(classId);
        if (!classExists) {
            throw new NotFoundRequestError("class not found");
        }
        const userExists = await userModel.findById(author);
        if (!userExists) {
            throw new NotFoundRequestError("User not found");
        }
        let fileMeta = null;

        if (attachments && attachments.buffer && attachments.mimetype) {
            const key = `posts/${uuidv4()}-${attachments.originalname}`;
            const command = uploadImage({
                key,
                body: attachments.buffer,
                fileType: attachments.mimetype,
            });
            await s3.send(command);

            fileMeta = {
                fileName: attachments.originalname,
                fileUrl: createUrlS3(key),
                fileType: attachments.mimetype,
            };
        }
        const newPost = await postModel.create({
            title,
            content,
            classroom: classExists._id,
            author: userExists._id,
            tags,
            attachments: fileMeta ? [fileMeta] : [],
        });
        return newPost;
    };
    static updatePost = async ({
        postId,
        title,
        content,
        course,
        author,
        tags,
        attachments,
    }) => {
        const updateData = {};
        if (!postId) throw new BadRequestError("Post ID is required");

        const foundPost = await postModel.findById(postId);
        if (!foundPost) {
            throw new NotFoundRequestError("Post not found");
        }

        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (course !== undefined) {
            const courseExists = await courseModel.findById(course);
            if (!courseExists) {
                throw new NotFoundRequestError("Course not found");
            }
            updateData.course = courseExists._id;
        }
        if (author !== undefined) {
            const userExists = await userModel.findById(author);
            if (!userExists) {
                throw new NotFoundRequestError("User not found");
            }
            updateData.author = userExists._id;
        }
        if (tags !== undefined) updateData.tags = tags;
        let fileMeta = null;
        if (attachments && attachments.buffer && attachments.mimetype) {
            const key = `posts/${uuidv4()}-${attachments.originalname}`;
            const command = uploadImage({
                key,
                body: attachments.buffer,
                fileType: attachments.mimetype,
            });
            await s3.send(command);

            fileMeta = {
                fileName: attachments.originalname,
                fileUrl: createUrlS3(key),
                fileType: attachments.mimetype,
            };
            updateData.attachments = fileMeta ? [fileMeta] : [];
        }
        const updatedPost = await postModel.findByIdAndUpdate(
            postId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );
        return updatedPost;
    };
    static deletePost = async ({ postId }) => {
        const existingPost = await postModel.findById(postId);
        if (!existingPost) {
            throw new NotFoundError("Post not found");
        }

        if (existingPost.isDeleted) {
            throw new BadRequestError("Post already deleted");
        }

        existingPost.isDeleted = true;
        await existingPost.save();
    };
}
module.exports = PostService;
