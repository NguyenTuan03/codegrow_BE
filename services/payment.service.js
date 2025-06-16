const crypto = require("crypto");
const moment = require("moment");
const qs = require("qs");
const { VNPAY, MOMO } = require("../configs/payment.config");
const {
    sortObject,
    extractUserIdFromOrderInfo,
} = require("../utils/sortObject.util");
const { BadRequestError } = require("../core/responses/error.response");
const { default: axios } = require("axios");
const enrollCourseModel = require("./models/enroll.model.js");
const courseModel = require("../models/course.model");
const { default: mongoose } = require("mongoose");
const paymentModel = require("../models/payment.model");
class paymentService {
    static createPayment = async ({
        req,
        amount,
        userId,
        courseId,
        paymentMethod,
    }) => {
        if (paymentMethod === "vnpay") {
            const ipAddr = "127.0.0.1";
            const tmnCode = process.env.VNP_TMN_CODE;
            const secretKey = process.env.VNP_HASH_SECRET;
            const vnpUrl = process.env.VNP_URL;
            const returnUrl = "http://localhost:8888/payment/vnpay/callback";

            const vnp_Params = {
                vnp_Version: "2.1.0",
                vnp_Command: "pay",
                vnp_TmnCode: tmnCode,
                vnp_Locale: "vn",
                vnp_CurrCode: "VND",
                vnp_TxnRef: courseId,
                vnp_OrderInfo: `Thanh toan khoa hoc ${courseId} ${userId}`,
                vnp_OrderType: "other",
                vnp_Amount: amount * 100,
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
            };

            const sortedParams = sortObject(vnp_Params);

            const signData = qs.stringify(sortedParams, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac
                .update(Buffer.from(signData, "utf-8"))
                .digest("hex");

            sortedParams["vnp_SecureHash"] = signed;

            const paymentUrl =
                vnpUrl + "?" + qs.stringify(sortedParams, { encode: false });
            console.log("Sign Data:", signData);
            console.log("Signed:", signed);
            console.log("Payment URL:", paymentUrl);
            return paymentUrl;
        }
        if (paymentMethod === "momo") {
            const timestamp = Date.now();
            const requestId = `${MOMO.partnerCode}${timestamp}`;
            const orderId = `${MOMO.partnerCode}-${timestamp}`;
            const orderInfo = "Thanh toan khoa hoc CodeGrow";
            const redirectUrl = MOMO.returnUrl;
            const ipnUrl = MOMO.notifyUrl;
            const extraData = Buffer.from(
                JSON.stringify({ userId, courseId }),
                "utf8"
            ).toString("base64");
            const requestType = "payWithMethod";
            const autoCapture = true;
            const lang = "vi";

            const rawSignature =
                `accessKey=${MOMO.accessKey}` +
                `&amount=${amount}` +
                `&extraData=${extraData}` +
                `&ipnUrl=${ipnUrl}` +
                `&orderId=${orderId}` +
                `&orderInfo=${orderInfo}` +
                `&partnerCode=${MOMO.partnerCode}` +
                `&redirectUrl=${redirectUrl}` +
                `&requestId=${requestId}` +
                `&requestType=${requestType}`;

            const signature = crypto
                .createHmac("sha256", MOMO.secretKey)
                .update(rawSignature)
                .digest("hex");

            const requestBody = {
                partnerCode: MOMO.partnerCode,
                partnerName: "CodeGrow Platform",
                storeId: "CodeGrowStore",
                requestId,
                amount: amount.toString(),
                orderId,
                orderInfo,
                redirectUrl,
                ipnUrl,
                lang,
                requestType,
                autoCapture,
                extraData,
                signature,
            };

            const response = await axios.post(MOMO.endpoint, requestBody, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.data && response.data.payUrl) {
                return response.data.payUrl;
            } else {
                throw new Error(
                    "MoMo payment error: " + JSON.stringify(response.data)
                );
            }
        }
        throw new BadRequestError("Invalid payment method");
    };
    static momoIpn = async ({
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData,
        signature,
    }) => {
        const rawSignature =
            `accessKey=${MOMO.accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&message=${message}` +
            `&orderId=${orderId}` +
            `&orderInfo=${orderInfo}` +
            `&orderType=${orderType}` +
            `&partnerCode=${partnerCode}` +
            `&payType=${payType}` +
            `&requestId=${requestId}` +
            `&responseTime=${responseTime}` +
            `&resultCode=${resultCode}` +
            `&transId=${transId}`;
        console.log("chạy ipn momo");

        const expectedSignature = crypto
            .createHmac("sha256", MOMO.secretKey)
            .update(rawSignature)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("Sai chữ ký từ IPN");
            throw new BadRequestError("Invalid signature");
        }
        // Step 2: Xử lý giao dịch
        if (resultCode === 0) {
            console.log("Thanh toán MoMo thành công:");

            const extraDecoded = JSON.parse(
                Buffer.from(extraData, "base64").toString("utf8")
            );
            console.log(extraDecoded);

            const { courseId, userId } = extraDecoded;

            await courseModel.findByIdAndUpdate(courseId, {
                $inc: { enrolledCount: 1 },
            });

            await enrollCourseModel.create({
                user: userId,
                course: courseId,
            });
        } else {
            console.log("Thanh toán MoMo thất bại:");
            throw new BadRequestError("Transaction failed");
        }
    };
    static vnpay = async ({ ipAddr, amount, orderId }) => {
        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        const vnp_Params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Locale: "vn",
            vnp_CurrCode: "VND",
            vnp_TxnRef: orderId,
            vnp_OrderInfo: "Thanh toan khoa hoc " + orderId,
            vnp_OrderType: "other",
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
        };

        const sortedParams = sortObject(vnp_Params);

        const signData = qs.stringify(sortedParams, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        sortedParams["vnp_SecureHash"] = signed;

        const paymentUrl =
            vnpUrl + "?" + qs.stringify(sortedParams, { encode: false });
        console.log("Sign Data:", signData);
        console.log("Signed:", signed);
        console.log("Payment URL:", paymentUrl);
        return paymentUrl;
    };
    static vnPayCallback = async ({ vnp_Params }) => {
        console.log(vnp_Params);
        const secureHash = vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];

        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
        const signed = hmac
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        if (secureHash !== signed) {
            throw new BadRequestError("Invalid signature!");
        }

        if (vnp_Params["vnp_ResponseCode"] === "00") {
            const courseId = vnp_Params["vnp_TxnRef"];
            const orderInfo = vnp_Params["vnp_OrderInfo"];
            const userId = extractUserIdFromOrderInfo(orderInfo);
            console.log(orderInfo, userId);
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new BadRequestError("Invalid userId in order info");
            }

            const alreadyEnrolled = await enrollCourseModel.findOne({
                user: userId,
                course: courseId,
            });

            if (!alreadyEnrolled) {
                await enrollCourseModel.create({
                    user: userId,
                    course: courseId,
                });

                await courseModel.findByIdAndUpdate(courseId, {
                    $inc: { enrolledCount: 1 },
                });
            }
            await paymentModel.create({
                user: userId,
                amount: Number(vnp_Params["vnp_Amount"]) / 100,
                transactionId: vnp_Params["vnp_TransactionNo"],
                status: "completed",
            });
            return "http://localhost:3000/payment/vnpay/success";
        } else {
            return "http://localhost:3000/payment/vnpay/failure";
        }
    };
    static getUSerById = async ({ userId }) => {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new BadRequestError("Invalid userId");
        }

        const payments = await paymentModel.find({ user: userId }).sort({
            createdAt: -1,
        });

        return payments;
    };
}

module.exports = paymentService;
