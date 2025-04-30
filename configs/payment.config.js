const VNPAY = {
    tmnCode: process.env.VNP_TMN_CODE,
    hashSecret: process.env.VNP_HASH_SECRET,
    url: process.env.VNP_URL,
    returnUrl: process.env.VNP_RETURN_URL,
};
const MOMO = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    endpoint: process.env.MOMO_ENDPOINT,
    notifyUrl: process.env.MOMO_NOTIFY_URL,
    returnUrl: process.env.MOMO_RETURN_URL,
};
module.exports = {
    VNPAY, MOMO
}