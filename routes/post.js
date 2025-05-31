var express = require('express');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const AuthMiddleware = require('../middlewares/auth.middleware');
const { checkRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../configs/user.config');
const multer = require('multer');
const postController = require('../controllers/post.controller');
const storage = multer.memoryStorage();
const upload = multer({ storage });
var router = express.Router();
/**
 * @swagger
 * /post:
 *   post:
 *     summary: Tạo bài viết liên quan đến khóa học
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []  # Yêu cầu xác thực bằng JWT
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - course
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tài liệu học JavaScript
 *               content:
 *                 type: string
 *                 example: File đính kèm là PDF tổng hợp kiến thức JS cơ bản.
 *               course:
 *                 type: string
 *                 example: 6651e1f0123abc...
 *               tags:
 *                 type: string
 *                 example: javascript,frontend
 *               attachments:
 *                 type: string
 *                 format: binary
 *                 description: Tệp đính kèm (PDF, Word, Excel, v.v.)
 *     responses:
 *       201:
 *         description: Bài viết đã được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Create a post successfully
 *                 metadata:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền hoặc chưa xác thực
 */
router.post('/',
    upload.single('attachments'),
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles: [USER_ROLES.MENTOR]})),
    catchAsyncHandle(postController.createPost)
)
/**
 * @swagger
 * /post/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               course:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Post updated successfully
 */

router.put('/:postId',
    upload.single('attachments'),
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles: [USER_ROLES.MENTOR]})),
    catchAsyncHandle(postController.updatePost)
);
/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to select
 *       - in: query
 *         name: expand
 *         schema:
 *           type: string
 *         description: Fields to populate
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('',
    catchAsyncHandle(postController.getAllPosts)
)
/**
 * @swagger
 * /post/{postId}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: Post details
 */
router.get('/:postId',
    catchAsyncHandle(postController.getPostById)
);
/**
 * @swagger
 * /post/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */

router.delete('/:postId',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles: [USER_ROLES.MENTOR]})),
    catchAsyncHandle(postController.deletePost)
);
module.exports = router;