var express = require('express');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const AuthMiddleware = require('../middlewares/auth.middleware');
const { checkRoles } = require('../middlewares/role.middleware');
const { USER_ROLES } = require('../configs/user.config');
const serviceController = require('../controllers/service.controller');
var router = express.Router();
/**
 * @swagger
 * /services/ticket:
 *   post:
 *     summary: User or mentor sends a support ticket/question to QAQC (Customer or mentor)
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, message, courseId]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Không gửi được bài quiz"
 *               message:
 *                 type: string
 *                 example: "Em làm bài quiz nhưng hệ thống báo lỗi không gửi được."
 *               courseId:
 *                 type: string
 *                 example: "663c3c5af3a2a125684c1123"
 *     responses:
 *       200:
 *         description: Ticket submitted successfully
 */

router.post('/ticket',    
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.USER, USER_ROLES.MENTOR]})),
    catchAsyncHandle(serviceController.SendTicket)
)
/**
 * @swagger
 * /services/ticket/{id}/reply:
 *   put:
 *     summary: QAQC replies to a user ticket (QAQC only)
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the ticket to reply to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qaqcReply, status]
 *             properties:
 *               qaqcReply:
 *                 type: string
 *                 example: "Cảm ơn bạn đã báo lỗi. Chúng tôi đã xử lý xong."
 *               status:
 *                 type: string
 *                 enum: [resolved, rejected]
 *                 example: resolved
 *     responses:
 *       200:
 *         description: Ticket replied successfully
 */
router.put('/ticket/:id/reply',    
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.QAQC]})),
    catchAsyncHandle(serviceController.responseTicket)
)
/**
 * @swagger
 * /services/ticket:
 *   get:
 *     summary: Get all user responses (QAQC only)
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: expand
 *     schema:
 *         type: string
 *         description: Fields to populate (e.g. sender recipient course repliedBy)
 *     responses:
 *       200:
 *         description: List of all responses
 */
router.get('/ticket',
    catchAsyncHandle(AuthMiddleware), 
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.QAQC]})),
    catchAsyncHandle(serviceController.getResponseTicket)
)
/**
 * @swagger
 * /services/ticket/mine:
 *   get:
 *     summary: Get responses of the authenticated user (user or mentor)
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: expand
 *     schema:
 *         type: string
 *         description: Fields to populate (e.g. course)
 *     responses:
 *       200:
 *         description: List of all responses
 */
router.get('/ticket/mine',
    catchAsyncHandle(AuthMiddleware), 
    catchAsyncHandle(checkRoles({requiredRoles:[USER_ROLES.USER,USER_ROLES.MENTOR]})),
    catchAsyncHandle(serviceController.getResponseMine)
)
module.exports = router