var express = require('express');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const paymentController = require('../controllers/payment.controller');
var router = express.Router();

// router.post('/create-vnpay',
//     catchAsyncHandle(paymentController.createVNpay)
// )
// router.get('/vnpay/callback',
//     catchAsyncHandle(paymentController.vnPayCallback)
// )
router.post('/momo/ipn',
    catchAsyncHandle(paymentController.momoIpn)
)
module.exports = router;