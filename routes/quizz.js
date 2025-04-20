var express = require('express');
var router = express.Router();
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const AuthMiddleware = require('../middlewares/auth.middleware');
const { checkRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../configs/user.config');
const quizzController = require('../controllers/quizz.controller');
/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Create a quiz (multiple choice or code challenge - ADMIN only)
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [lesson, type, questionText]
 *             properties:
 *               lesson:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [multiple_choice, code]
 *               questionText:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *               starterCode:
 *                 type: string
 *               expectedOutput:
 *                 type: string
 *               language:
 *                 type: string
 *               testCases:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: string
 *                     expectedOutput:
 *                       type: string
 *               explanation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quiz created
 */
router.post('/',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(quizzController.createQuizz)
)
/**
 * @swagger
 * /quizzes/submit:
 *   post:
 *     summary: Submit code answer and run test cases
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quizId, code]
 *             properties:
 *               quizId:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission result
 */
router.post('/submit',
    catchAsyncHandle(quizzController.submitCode)
)

/**
 * @swagger
 * /quizzes/{id}:
 *   put:
 *     summary: Update a quiz by ID (supports both multiple_choice and code types - ADMIN only)
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Quiz ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionText:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                     isCorrect:
 *                       type: boolean
 *               starterCode:
 *                 type: string
 *               explanation:
 *                 type: string
 *               testCases:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     input:
 *                       type: string
 *                     expectedOutput:
 *                       type: string
 *               language:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Quiz not found
 */
router.put('/:id', 
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(quizzController.updateQuiz) 
);
/**
 * @swagger
 * /quizzes/{id}:
 *   delete:
 *     summary: Soft delete a quiz by ID (ADMIN only)
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       404:
 *         description: Quiz not found
 */
router.delete('/:id', 
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.ADMIN]})),
    catchAsyncHandle(quizzController.deleteQuizz) 
);
/**
 * @swagger
 * /quizzes/submission:
 *   get:
 *     summary: Get latest submission by the authenticated user
 *     tags: [Submission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Submission retrieved successfully
 *       404:
 *         description: No submission found for this user
 */
router.get('/submission',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(quizzController.getSubmission)
)
module.exports = router