const { BadRequestError } = require("../core/responses/error.response");
const { default: axios } = require("axios");
const { default: mongoose } = require("mongoose");
const paymentModel = require("../models/payment.model");
const { generateSignature } = require("../utils/generateSignature.util");
const userModel = require("../models/user.model");
const courseModel = require("../models/course.model");
const crypto = require("crypto");
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

        const orderCode = Date.now();
        const extraData = Buffer.from(
            JSON.stringify({ userId, courseId })
        ).toString("base64");

        // ✅ Đầu tiên khai báo payload
        const payload = {
            amount,
            orderCode,
            description: "Thanh toán khóa học",
            returnUrl: PAYOS.returnUrl,
            cancelUrl: PAYOS.cancelUrl,
            extraData,
        };

        // ✅ Sau đó mới in ra payload
        Object.keys(payload).forEach((k) => {
            console.log(`${k}: ${payload[k]}`);
        });

        // ✅ Tạo signature sau khi payload đã có
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
        const paymentInfo = await getPaymentFromPayOS(orderCode);
        if (paymentInfo.status !== "PAID") {
            return { redirectUrl: process.env.PAYOS_FAILED };
        }

        await paymentModel.create({
            user: userId,
            amount: paymentInfo.amount,
            transactionId: String(orderCode),
            status: "completed",
        });

        const user = await userModel.findById(userId).select("enrolledCourses");
        if (!user) throw new BadRequestError("User not found");

        if (!user.enrolledCourses.includes(courseId)) {
            await userModel.findByIdAndUpdate(userId, {
                $addToSet: { enrolledCourses: courseId },
            });

            await courseModel.findByIdAndUpdate(courseId, {
                $addToSet: { students: userId },
                $inc: { enrolledCount: 1 },
            });
        }

        return {
            redirectUrl: `${process.env.PAYOS_SUCCESS}?order=${orderCode}`,
        };
    };
}

module.exports = paymentService;
