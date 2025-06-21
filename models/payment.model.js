const mongoose = require("mongoose");
const isDeleteSchema = require("./isDelete.model");

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
    createdAt: {
         type: Date, 
         default: Date.now 
    },
    ...isDeleteSchema.obj
});

module.exports = mongoose.model("Payment", PaymentSchema);
