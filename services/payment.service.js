const { BadRequestError } = require("../core/responses/error.response");
const { default: axios } = require("axios");
const { default: mongoose } = require("mongoose");
const paymentModel = require("../models/payment.model");
const { generateSignature } = require("../utils/generateSignature.util");
class paymentService {
    static getUSerById = async ({ userId }) => {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new BadRequestError("Invalid userId");
        }

        const payments = await paymentModel.find({ user: userId }).sort({
            createdAt: -1,
        });

        return payments;
    };
    static getPaymentFromPayOS = async (orderCode) => {
        const url = `${process.env.PAYOS_ENDPOINT}/${orderCode}`;
        const headers = {
            "x-client-id": process.env.PAYOS_CLIENT_ID,
            "x-api-key": process.env.PAYOS_API_KEY,
        };

        const res = await axios.get(url, { headers });
        return res.data.data;
    };
    static createPayOSPayment = async ({ req, amount, userId, courseId }) => {
        const PAYOS = {
            clientId: process.env.PAYOS_CLIENT_ID,
            apiKey: process.env.PAYOS_API_KEY,
            checksumKey: process.env.PAYOS_CHECKSUM_KEY,
            endpoint: process.env.PAYOS_ENDPOINT,
            returnUrl: process.env.PAYOS_CALLBACK,
            cancelUrl: process.env.PAYOS_CANCEL,
        };
        console.log("=== Đang dùng callback ===", process.env.PAYOS_CALLBACK);
        const orderCode = Date.now();
        const payload = {
            orderCode: orderCode,
            amount: amount,
            description: `Thanh toán khóa học`,
            cancelUrl: PAYOS.cancelUrl,
            returnUrl: PAYOS.returnUrl,
        };

        const signature = generateSignature(payload, PAYOS.checksumKey);

        const headers = {
            "x-client-id": PAYOS.clientId,
            "x-api-key": PAYOS.apiKey,
            "Content-Type": "application/json",
        };

        const res = await axios.post(
            PAYOS.endpoint,
            {
                ...payload,
                signature,
            },
            { headers }
        );
        const payOSRes = res.data?.data;
        if (!payOSRes?.checkoutUrl) {
            throw new Error("Tạo link thanh toán PayOS thất bại");
        }

        return payOSRes.checkoutUrl;
    };
    static payOSCallback = async ({ orderCode, status, userId, courseId }) => {
        try {
            const paymentInfo = await getPaymentFromPayOS(orderCode);
            if (paymentInfo.status !== "PAID") {
                return res.redirect(process.env.PAYOS_FAILED);
            }

            await paymentModel.create({
                user: userId,
                amount: paymentInfo.amount,
                transactionId: String(orderCode),
            });

            const user = await userModel.findById(id).select("enrollCourses");
            if (!user) throw new BadRequestError("User not found");

            if (!user.enrollCourses.includes(courseId)) {
                await userModel.findByIdAndUpdate(userId, {
                    $addToSet: { enrollCourses: courseId },
                });

                await courseModel.findByIdAndUpdate(courseId, {
                    $addToSet: { students: userId },
                    $inc: { enrolledCount: 1 },
                });
            }

            return res.redirect(
                `${process.env.PAYOS_SUCCESS}?order=${orderCode}`
            );
        } catch (err) {
            console.error("Callback xử lý thất bại:", err);
            return res.redirect(process.env.PAYOS_ERROR);
        }
    };
}

module.exports = paymentService;
