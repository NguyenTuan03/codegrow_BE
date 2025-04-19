var express = require('express');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
var router = express.Router();
const CategoryController = require('../controllers/category.controller')
/**
 * @swagger
 * /category:
 *   get:
 *     summary: Get all Category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Categories
 */
router.get('/',
    catchAsyncHandle(CategoryController.getAll)
)
module.exports = router