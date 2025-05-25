var express = require('express');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const AuthMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const {checkRoles, checkUserOrAdmin} = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../configs/user.config');
var router = express.Router();
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
router.get('/',    
    catchAsyncHandle(userController.getAllUsers)
)
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
router.get('/:id',
    catchAsyncHandle(userController.getUserById)
)
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
router.post('/',
    catchAsyncHandle(AuthMiddleware),
    checkRoles({requiredRoles: [USER_ROLES.ADMIN]}),
    catchAsyncHandle(userController.createUser)
)
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
router.put('/:id',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkUserOrAdmin),
    catchAsyncHandle(userController.updateUser)
)

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
router.delete('/:id',
    catchAsyncHandle(AuthMiddleware),
    checkRoles({requiredRoles:[USER_ROLES.ADMIN]}),
    catchAsyncHandle(userController.deleteUser)
)
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
router.post('/enroll',
    catchAsyncHandle(AuthMiddleware),
    checkRoles({requiredRoles:[USER_ROLES.USER]}),
    catchAsyncHandle(userController.enrollCourse)
)
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
router.post('/enroll-class',
    catchAsyncHandle(AuthMiddleware),
    checkRoles({requiredRoles:[USER_ROLES.USER]}),
    catchAsyncHandle(userController.enrollClass)
)
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
router.get('/enroll-class/pending',
    catchAsyncHandle(userController.getListConsultedUser)
)
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
router.post('/progress/lesson-complete',
    catchAsyncHandle(AuthMiddleware),    
    catchAsyncHandle(userController.lessonComplete)
)
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

router.post('/progress/quizz-complete',
    catchAsyncHandle(AuthMiddleware),    
    catchAsyncHandle(userController.quizzComplete)
)
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
router.get('/:id/progress', 
    catchAsyncHandle(AuthMiddleware),    
    catchAsyncHandle(userController.getProgress)
)
module.exports = router;