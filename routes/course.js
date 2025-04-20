var express = require('express');
var router = express.Router();
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const courseController = require('../controllers/course.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const { checkRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../configs/user.config');

/**
 * @swagger
 * /course:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: expand
 *         schema:
 *           type: string
 *         description: Fields to populate (e.g., author)
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/',    
    catchAsyncHandle(courseController.getAllCourses)
)
/**
 * @swagger
 * /course/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Course not found
 */
router.get('/:id',
    catchAsyncHandle(courseController.getCourseById)
)
/**
 * @swagger
 * /course:
 *   post:
 *     summary: Create a new course (ADMIN only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(courseController.createCourse)
)
/**
 * @swagger
 * /course/{id}:
 *   put:
 *     summary: Update a course (ADMIN only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       404:
 *         description: Course not found
 */
router.put('/:id',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(courseController.updateCourse)
)
/**
 * @swagger
 * /course/{id}:
 *   delete:
 *     summary: Delete a course (ADMIN only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       404:
 *         description: Course not found
 */
router.delete('/:id',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(courseController.deleteCourse)
)
/**
 * @swagger
 * /course/{id}/students:
 *   get:
 *     summary: Get list students by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: students found
 *       404:
 *         description: students not found
 */
router.get('/:id/students',
    catchAsyncHandle(courseController.getStudentsEnrolled)
)
/**
 * @swagger
 * /courses/{id}/lessons:
 *   get:
 *     summary: Get all lessons in a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Course ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of lessons
 */
router.get('/:id/lessons',
    catchAsyncHandle(courseController.getLessonsByCourse)
)
module.exports = router;