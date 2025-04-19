var express = require('express');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const enrollController = require('../controllers/enroll.controller');
var router = express.Router();
/**
 * @swagger
 * /enroll:
 *   get:
 *     summary: Get all enrollments
 *     tags: [Enrollment]
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
 *         description: Fields to populate (e.g., user, course)
 *     responses:
 *       200:
 *         description: List of Enrollments
 */
router.get('/',    
    catchAsyncHandle(enrollController.getAllEnroll)
)
/**
 * @swagger
 * /enroll/{id}:
 *   get:
 *     summary: Get a Enrollment by ID
 *     tags: [Enrollment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment found
 *       404:
 *         description: Enrollment not found
 */
router.get('/:id',
    catchAsyncHandle(enrollController.getEnrollById)
)
module.exports = router;