const courseModel = require("../models/course.model");
const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const { createUrlS3, s3, uploadImage } = require("../utils/s3client");
const { v4: uuidv4 } = require("uuid");
class PostService {
    static createPost = async ({
        title,
        content,
        course,
        author,
        tags,
        attachments,
    }) => {
        if (!title || !content || !course) {
            throw new BadRequestError(
                "Missing any required fields: title, content, course"
            );
        }
        const courseExists = await courseModel.findById(course);
        if (!courseExists) {
            throw new NotFoundRequestError("Course not found");
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
            course: courseExists._id,
            author: userExists._id,
            tags,
            attachments: fileMeta ? [fileMeta] : [],
        });
        return newPost;
    };
}
module.exports = PostService;
