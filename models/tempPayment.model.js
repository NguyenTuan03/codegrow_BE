const { default: mongoose } = require("mongoose");

const tempPaymentSchema = new mongoose.Schema({
    orderCode: { type: String, required: true, unique: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
    amount: Number,
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now, expires: 3600 },
});
module.exports = mongoose.model("TempPayment", tempPaymentSchema);
