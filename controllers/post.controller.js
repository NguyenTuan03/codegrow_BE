const { filter } = require("lodash");
const { SELECT_POST, FILTER_USER } = require("../configs/user.config");
const { CREATED, UPDATED, OK, DELETED } = require("../core/responses/success.response");
const PostService = require("../services/post.service");

class postController {
    getAllPosts = async (req, res) => {
        new OK({
            message: "Get all posts successfully",
            metadata: await PostService.getAllPost({
                limit: req.query.limit || 1000,
                sort: req.query.sort || "ctime",
                page: req.query.page || 1,
                filter: {
                    isDeleted: false,
                },
                select: req.query.select || SELECT_POST.FULL,
                expand: req.query.expand || "",
            }),
        }).send(res);
    }
    getPostById = async (req, res) => {
        new OK({
            message: "Get post successfully",
            metadata: await PostService.getPostById(req.params, {
                filter: {
                    isDeleted: false,
                }
            }),
        }).send(res);
    }
    createPost = async (req, res) => {
        new CREATED({
            message: "Create a post successfully",
            metadata: await PostService.createPost({
                title: req.body.title,
                content: req.body.content,
                classroom: req.body.classroom,
                author: req.userId,
                tags: req.body.tags,
                attachments: req.file,
            }),
        }).send(res);
    };
    updatePost = async (req, res) => {
        new UPDATED({
            message: "Update a post successfully",
            metadata: await PostService.updatePost({
                postId: req.params.postId,
                title: req.body.title,
                content: req.body.content,
                course: req.body.course,
                author: req.userId,
                tags: req.body.tags,
                attachments: req.file,
            }),
        }).send(res);
    };
    deletePost = async (req, res) => {
        new DELETED({
            message: "Delete a post successfully",
            metadata: await PostService.deletePost(req.params),
        }).send(res);
    };
}
module.exports = new postController();
