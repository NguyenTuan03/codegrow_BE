var express = require("express");
const { catchAsyncHandle } = require("../middlewares/error.middleware");
const AuthMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const {
    checkRoles,
    checkUserOrAdmin,
} = require("../middlewares/role.middleware");
const { USER_ROLES } = require("../configs/user.config");
var router = express.Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API cho người dùng
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get list users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Get all users successfully
 */
router.get("/", catchAsyncHandle(userController.getAllUsers));
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Get user successfully
 */
router.get("/:id", catchAsyncHandle(userController.getUserById));
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Create user successfully
 */
router.post(
    "/",
    catchAsyncHandle(AuthMiddleware),
    checkRoles({ requiredRoles: [USER_ROLES.ADMIN] }),
    catchAsyncHandle(userController.createUser)
);
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user (ADMIN OR USER)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Update user successfully
 */
router.put(
    "/:id",
    upload.single("avatar"),
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkUserOrAdmin),
    catchAsyncHandle(userController.updateUser)
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Delete user successfully
 */
router.delete(
    "/:id",
    catchAsyncHandle(AuthMiddleware),
    checkRoles({ requiredRoles: [USER_ROLES.ADMIN] }),
    catchAsyncHandle(userController.deleteUser)
);
/**
 * @swagger
 * /users/enroll:
 *   post:
 *     summary: Enroll user in a course (wallet required)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 description: ObjectId of the course to enroll
 *     responses:
 *       201:
 *         description: User enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Enrollment successful
 *                 status:
 *                   type: number
 *                   example: 201
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                       example: "67fd1e9adee0b3e3595fe4c3"
 *                     course:
 *                       type: string
 *                       example: "6800caf08ff7c88c32cfd7ed"
 *                     progress:
 *                       type: number
 *                       example: 0
 *                     completed:
 *                       type: boolean
 *                       example: false
 *                     isDeleted:
 *                       type: boolean
 *                       example: false
 *                     _id:
 *                       type: string
 *                       example: "680127a050c53e55d642b117"
 *                     enrolledAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-17T16:09:04.705Z"
 *                     __v:
 *                       type: number
 *                       example: 0
 *       400:
 *         description: Validation or business logic error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Insufficient balance to enroll in this course
 */
router.post(
    "/enroll",
    catchAsyncHandle(AuthMiddleware),
    checkRoles({ requiredRoles: [USER_ROLES.USER] }),
    catchAsyncHandle(userController.enrollCourse)
);

/**
 * @swagger
 * /users/enroll-class:
 *   post:
 *     summary: Submit student registration form for class consultation
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phone, note]
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               note:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Form submitted successfully
 */
router.post(
    "/enroll-class",
    catchAsyncHandle(AuthMiddleware),
    checkRoles({ requiredRoles: [USER_ROLES.USER] }),
    catchAsyncHandle(userController.enrollClass)
);
/**
 * @swagger
 * /users/enroll-class/pending:
 *   get:
 *     summary: Get list of users who have not been consulted
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of pending registrations
 */
router.get(
    "/enroll-class/pending",
    catchAsyncHandle(userController.getListConsultedUser)
);
/**
 * @swagger
 * /users/progress/lesson-complete:
 *   post:
 *     summary: Mark a lesson as completed by the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lessonId, courseId]
 *             properties:
 *               lessonId:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lesson marked as completed
 */
router.post(
    "/progress/lesson-complete",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(userController.lessonComplete)
);
/**
 * @swagger
 * /users/progress/quizz-complete:
 *   post:
 *     summary: Mark a quiz as completed by the current user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quizId, courseId]
 *             properties:
 *               quizId:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quiz marked as completed
 */

router.post(
    "/progress/quizz-complete",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(userController.quizzComplete)
);
/**
 * @swagger
 * /users/{id}/progress:
 *   get:
 *     summary: Get progress of the authenticated user for a course
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID to retrieve progress for
 *     responses:
 *       200:
 *         description: Progress retrieved
 */
router.get(
    "/:id/progress",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(userController.getProgress)
);
/**
 * @swagger
 * /users/chat:
 *   post:
 *     summary: Gửi câu hỏi về khóa học cho AI và nhận câu trả lời diễn giải.
 *     tags:
 *       - AI Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - promt
 *             properties:
 *               promt:
 *                 type: string
 *                 example: "Giới thiệu giúp tôi về khóa học Lập trình JavaScript cơ bản"
 *                 description: Câu hỏi hoặc yêu cầu của người dùng, có thể bao gồm tên khóa học.
 *     responses:
 *       200:
 *         description: Thành công, trả về câu trả lời từ AI.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: response successful
 *                 status:
 *                   type: number
 *                   example: 200
 *                 metadata:
 *                   type: string
 *                   example: "Khóa học Lập trình JavaScript cơ bản sẽ hướng dẫn bạn từ những kiến thức nền tảng..."
 *       400:
 *         description: Thiếu dữ liệu đầu vào hoặc định dạng sai.
 *       500:
 *         description: Lỗi hệ thống hoặc lỗi khi gọi GPT API.
 */
router.post("/chat", catchAsyncHandle(userController.getCourseInfo));
module.exports = router;
/**
 * @swagger
 * /users/auto-feedback:
 *   post:
 *     summary: Tự động phản hồi câu hỏi của người học dựa trên tiến độ học tập.
 *     tags:
 *       - AI Learning
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - prompt
 *             properties:
 *               promt:
 *                 type: string
 *                 description: Câu hỏi của người học (có thể là về nội dung tiếp theo, mục tiêu học, v.v.)
 *                 example: "Tôi có nên học tiếp lên React không?"
 *     responses:
 *       200:
 *         description: Thành công. Trả về phản hồi của AI dựa trên tiến độ học tập.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: response successful
 *                 status:
 *                   type: number
 *                   example: 200
 *                 metadata:
 *                   type: string
 *                   example: "Dựa trên tiến độ hiện tại, bạn đã nắm vững JavaScript cơ bản và hoàn toàn có thể bắt đầu học React..."
 *       400:
 *         description: Thiếu thông tin đầu vào hoặc dữ liệu không hợp lệ.
 *       404:
 *         description: Không tìm thấy dữ liệu tiến độ học của người dùng.
 *       500:
 *         description: Lỗi nội bộ khi xử lý hoặc gọi GPT API.
 */
router.post(
    "/auto-feedback",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(userController.getAutoFeedback)
);
/**
 * @swagger
 * /users/suggest-practice:
 *   post:
 *     summary: Gợi ý bài luyện tập dựa trên điểm yếu học tập.
 *     tags:
 *       - AI Learning
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "665fa123bcde45..."
 *                 description: ID của người học.
 *     responses:
 *       200:
 *         description: Gợi ý thành công.
 *       400:
 *         description: Thiếu userId.
 *       500:
 *         description: Lỗi hệ thống hoặc GPT.
 */

router.post(
    "/suggest-practice",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(userController.suggestPractice)
);
