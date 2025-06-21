const crypto = require('crypto')
function generateSignature(data, checksumKey) {
    const sortedKeys = Object.keys(data).sort();
    const signData = sortedKeys.map((key) => `${key}=${data[key]}`).join("&");
    return crypto
        .createHmac("sha256", checksumKey)
        .update(signData)
        .digest("hex");
}
module.exports = { generateSignature };
