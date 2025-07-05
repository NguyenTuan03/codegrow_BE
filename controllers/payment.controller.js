const { CREATED, OK } = require("../core/responses/success.response");
const paymentService = require("../services/payment.service");
class paymentController {
    // createVNpay = async(req,res) => {
    //     new CREATED({
    //         message: 'payment by VNpay successfully',
    //         metadata: await paymentService.createVNpay(req.body)
    //     }).send(res)
    // }
    // vnPayCallback = async(req,res) => {
    //     const { vnp_ResponseCode } = req.query;
    //     if (vnp_ResponseCode == '00') {
    //         await updateUserPremium(req.userId);
    //         return res.redirect('/payment-success');
    //     } else {
    //         return res.redirect('/payment-fail');
    //     }
    // }
    momoIpn = async (req, res) => {
        new OK({
            message: "Response momo successfully",
            metadata: await paymentService.momoIpn(req.body),
        }).send(res);
    };
    vnPay = async (req, res) => {
        new OK({
            message: "Response vnpay sucessfully",
            metadata: await paymentService.vnpay({
                ipAddr: "127.0.0.1",
                amount: req.query.amount,
                orderId: req.query.orderId,
            }),
        }).send(res);
    };
    vnPayCallback = async (req, res) => {
        new OK({
            message: "vnpay callback sucessfully",
            metadata: await paymentService.vnPayCallback({
                vnp_Params: req.query,
            }),
        }).send(res);
    };
    getUSerById = async (req, res) => {
        new OK({
            message: "Get payment's user successfully",
            metadata: await paymentService.getUSerById({
                userId: req.params.userId,
            }),
        }).send(res);
    };
    payOSCallback = async (req, res) => {
        try {
            const { redirectUrl } = await paymentService.payOSCallback({
                orderCode: req.query.orderCode,
                status: req.query.status,
                userId: req.query.userId,
                courseId: req.query.courseId,
                data: req.query,
            });
            return res.redirect(redirectUrl);
        } catch (err) {
            console.error("Callback xử lý thất bại:", err);
            return res.redirect(process.env.PAYOS_ERROR);
        }
    };
    cancelPayment = (req, res) => {
        return res.redirect(`${process.env.PAYOS_FAILED}?canceled=true`);
    };
}
module.exports = new paymentController();
