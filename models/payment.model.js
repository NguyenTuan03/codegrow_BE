const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    amount: {
         type: Number, 
         required: true 
    },
    transactionId: {
         type: String, 
         required: true, 
         unique: true 
    },
    status: {
         type: String, 
         enum: ["pending", "completed", "failed"], 
         default: "pending" 
    },
    createdAt: {
         type: Date, 
         default: Date.now 
    },
});

module.exports = mongoose.model("Payment", PaymentSchema);
