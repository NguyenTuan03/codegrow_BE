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
module.exports = router;