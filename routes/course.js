var express = require('express');
var router = express.Router();
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const courseController = require('../controllers/course.controller');
/**
 * @swagger
 * /course:
 *   get:
 *     summary: Get all courses
 *     tags: [Course]
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/',    
    catchAsyncHandle(courseController.getAllCourses)
)
module.exports = router;