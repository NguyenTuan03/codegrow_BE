const crypto = require("crypto");

function generateSignature(data, checksumKey) {
    const rawData =
        `amount=${data.amount}` +
        `&cancelUrl=${data.cancelUrl}` +
        `&description=${data.description}` +
        `&orderCode=${data.orderCode}` +
        `&returnUrl=${data.returnUrl}`;
    return crypto
        .createHmac("sha256", checksumKey)
        .update(rawData)
        .digest("hex");
}
module.exports = { generateSignature };
