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
module.exports = router;