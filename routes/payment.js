var express = require("express");
const { catchAsyncHandle } = require("../middlewares/error.middleware");
const paymentController = require("../controllers/payment.controller");
const AuthMiddleware = require("../middlewares/auth.middleware");
var router = express.Router();

// router.post('/create-vnpay',
//     catchAsyncHandle(paymentController.createVNpay)
// )
router.get(
    "/vnpay/callback",
    catchAsyncHandle(paymentController.vnPayCallback)
);
router.post("/momo/ipn", catchAsyncHandle(paymentController.momoIpn));
router.get("/create-payment-url", catchAsyncHandle(paymentController.vnPay));
/**
 * @swagger
 * /payment/{userId}:
 *   get:
 *     summary: Get payments by user ID
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: List of payments for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get payment's user successfully
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 metadata:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 666abc...
 *                       user:
 *                         type: string
 *                         example: 680022e3...
 *                       amount:
 *                         type: number
 *                         example: 500000
 *                       transactionId:
 *                         type: string
 *                         example: "15019797"
 *                       status:
 *                         type: string
 *                         enum: [pending, completed, failed]
 *                         example: completed
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-16T04:10:11.000Z"
 *       400:
 *         description: Invalid userId
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
    "/:userId",
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(paymentController.getUSerById)
);
router.get(
    "/payos/callback",
    catchAsyncHandle(paymentController.payOSCallback)
);
router.get("/payos/cancel", paymentController.cancelPayment);
module.exports = router;
