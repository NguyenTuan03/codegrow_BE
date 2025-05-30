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
 * /posts:
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
module.exports = router;