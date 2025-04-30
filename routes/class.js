const classController = require('../controllers/class.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
const { catchAsyncHandle } = require('../middlewares/error.middleware')
var express = require('express');
const { checkRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../configs/user.config');
var router = express.Router();
/**
 * @swagger
 * /classrooms:
 *   get:
 *     summary: Get all classrooms
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classrooms
 */
router.get('/',    
    catchAsyncHandle(classController.getAllClasses)
)
/**
 * @swagger
 * /classrooms/{id}:
 *   get:
 *     summary: Get classroom by ID
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom details
 */
router.get('/:id',
    catchAsyncHandle(classController.getClassById)
)
/**
 * @swagger
 * /classrooms:
 *   post:
 *     summary: Create a new classroom (ADMIN only)
 *     tags: [Classrooms]
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
 *               - courseId
 *               - maxStudents
 *               - schedule
 *             properties:
 *               title:
 *                 type: string
 *               courseId:
 *                 type: string
 *                 description: Course ObjectId
 *               description:
 *                 type: string
 *               maxStudents:
 *                 type: integer
 *               schedule:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   daysOfWeek:
 *                     type: array
 *                     items:
 *                       type: string
 *                   time:
 *                     type: string
 *     responses:
 *       201:
 *         description: Classroom created successfully
 */
router.post('/',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(classController.createClassroom)
)
/**
 * @swagger
 * /classrooms/{id}:
 *   put:
 *     summary: Update classroom (ADMIN only)
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Classroom ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               courseId:
 *                 type: string
 *               mentor:
 *                 type: string
 *               description:
 *                 type: string
 *               maxStudents:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [open, assigned, in-progress, completed]
 *               schedule:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                     format: date
 *                   endDate:
 *                     type: string
 *                     format: date
 *                   daysOfWeek:
 *                     type: array
 *                     items:
 *                       type: string
 *                   time:
 *                     type: string
 *     responses:
 *       200:
 *         description: Classroom updated successfully
 */
router.put('/:id',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(classController.updateClassroom)
)
/**
 * @swagger
 * /classrooms/{id}:
 *   delete:
 *     summary: Delete classroom (soft delete - ADMIN only)
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Classroom deleted successfully
 */
router.delete('/:id',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(classController.deleteClassroom)
)
/**
 * @swagger
 * /classrooms/{id}/assign-mentor:
 *   patch:
 *     summary: Mentor accepts a class to teach
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Classroom ID
 *     responses:
 *       200:
 *         description: Mentor assigned to class successfully
 *       400:
 *         description: Class already has a mentor
 *       403:
 *         description: Only mentors can perform this action
 */
router.patch('/:id/assign-mentor',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.MENTOR]})),
    catchAsyncHandle(classController.assignMentor)
)
/**
 * @swagger
 * /classrooms/{id}/add-student:
 *   patch:
 *     summary: Admin adds a student to a classroom
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Classroom ID
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
 *                 description: User ID of the student to add
 *     responses:
 *       200:
 *         description: Student added successfully
 *       400:
 *         description: User not found or already enrolled
 */
router.patch('/:id/add-student',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(classController.addStudentsToClass)
)
/**
 * @swagger
 * /classrooms/review/mentor:
 *   post:
 *     summary: QAQC writes a review for a mentor
 *     tags: [Classrooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mentorId, rating, comment]
 *             properties:
 *               mentorId:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/review/mentor',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.QAQC]})),
    catchAsyncHandle(classController.reviewMentor)
)
/**
 * @swagger
 * /classrooms/review/mentor:
 *   get:
 *     summary: Get all mentors
 *     tags: [Classrooms]
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
 *         description: List of reviews
 */
router.get('/review/mentor',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.QAQC]})),
    catchAsyncHandle(classController.getMentorReviews)
)
/**
 * @swagger
 * /classrooms/review/{id}/mentor:
 *   get:
 *     summary: Get a review by ID
 *     tags: [Classrooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: review ID
 *     responses:
 *       200:
 *         description: A Review found
 *       404:
 *         description: Review not found
 */
router.get('/review/:id/mentor',        
    catchAsyncHandle(classController.getReviewById)
)
module.exports = router;