var express = require("express");
const { catchAsyncHandle } = require("../middlewares/error.middleware");
const AuthMiddleware = require("../middlewares/auth.middleware");
const { checkRoles } = require("../middlewares/role.middleware");
const { USER_ROLES } = require("../configs/user.config");
const lessonController = require("../controllers/lesson.controller");
var router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
/**
 * @swagger
 * /lesson:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [course, title, order]
 *             properties:
 *               course:
 *                 type: string
 *                 description: Course ID
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               order:
 *                 type: number
 *               videoKey:
 *                 type: string
 *               videoUrl:
 *                 type: string
 *               quiz:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Lesson created successfully
 */
router.post(
    "/",
    upload.single("video"),
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({ requiredRoles: [USER_ROLES.ADMIN] })),
    catchAsyncHandle(lessonController.createLesson)
);
/**
 * @swagger
 * lesson/media/generate-upload-url:
 *   post:
 *     summary: Generate a pre-signed S3 URL for video upload (Admin only)
 *     tags: [Lesson]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileName, fileType]
 *             properties:
 *               fileName:
 *                 type: string
 *               fileType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upload URL created
 */
router.post(
    "/media/generate-upload-url",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({ requiredRoles: [USER_ROLES.ADMIN] })),
    catchAsyncHandle(lessonController.uploadVideo)
);
/**
 * @swagger
 * /lesson/{id}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Lesson found
 *       404:
 *         description: Lesson not found
 */
router.get("/:id", catchAsyncHandle(lessonController.getLessonById));

/**
 * @swagger
 * /lesson/{id}/review:
 *   put:
 *     summary: Review and mark lesson by QA (QA only)
 *     tags: [Lesson]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, done]
 *               note:
 *                 type: string
 *               mark:
 *                 type: string
 *                 enum: [A+, A, B, C, D]
 *     responses:
 *       200:
 *         description: Lesson reviewed successfully
 *       404:
 *         description: Lesson not found
 */
router.put(
    "/:id/review",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({ requiredRoles: [USER_ROLES.QAQC] })),
    catchAsyncHandle(lessonController.reviewLesson)
);
router.delete(
    "/:id",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({ requiredRoles: [USER_ROLES.ADMIN] })),
    catchAsyncHandle(lessonController.deleteLesson)
);
module.exports = router;
