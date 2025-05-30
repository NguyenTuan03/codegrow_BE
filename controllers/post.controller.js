const { CREATED } = require("../core/responses/success.response");
const PostService = require("../services/post.service");

class postController {
    createPost = async (req, res) => {
        new CREATED({
            message: "Create a post successfully",
            metadata: await PostService.createPost({
                title: req.body.title,
                content: req.body.content,
                course: req.body.course,
                author: req.userId,
                tags: req.body.tags,
                attachments: req.file 
            }),
        }).send(res);
    };
}
module.exports = new postController();