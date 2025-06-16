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
    getUSerById = async (req,res) => {
        new OK({
            message: "Get payment's user successfully",
            metadata: await paymentService.getUSerById({
                userId: req.params.userId,
            }),
        }).send(res);
    }
}
module.exports = new paymentController();
