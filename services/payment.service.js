const crypto = require('crypto');
const moment = require('moment');
const qs = require('qs');
const {VNPAY,MOMO} = require('../configs/payment.config');
const { sortObject } = require('../utils/sortObject.util');
const { BadRequestError } = require('../core/responses/error.response');
const { default: axios } = require('axios');
const enrollCourseModel = require('../models/enroll.model');
const courseModel = require('../models/course.model');
class paymentService {
    static createPayment = async ({req,amount, userId, courseId, paymentMethod}) => {        
        if (paymentMethod === 'vnpay') {
            const createDate = moment().format('YYYYMMDDHHmmss');
            const orderId = moment().format('DDHHmmss');
            const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;            
            const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss');
            let vnp_Params = {
                vnp_Version: '2.1.0',
                vnp_Command: 'pay',
                vnp_TmnCode: VNPAY.tmnCode,
                vnp_Amount: amount * 100,
                vnp_CurrCode: 'VND',
                vnp_TxnRef: `${orderId}-${courseId}`,
                vnp_OrderInfo: `Thanh toan khoa hoc CodeGrow`,
                vnp_OrderType: 'billpayment',
                vnp_Locale: 'vn',
                vnp_ReturnUrl: VNPAY.returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate,
                vnp_ExpireDate: expireDate,
            };

            const sortedParams = sortObject(vnp_Params);
            const signData = Object.entries(sortedParams)
                .map(([key, value]) => `${key}=${value}`)
                .join('&');
                        
            const secureHash = crypto.createHmac('sha512', VNPAY.hashSecret)
                .update(signData)
                .digest('hex');
            
            sortedParams['vnp_SecureHash'] = secureHash;
            
            const paymentUrl = `${VNPAY.url}?${qs.stringify(sortedParams, { encode: false })}`;
            
            return paymentUrl;
        } 
        if (paymentMethod === 'momo') {
            const timestamp = Date.now();
            const requestId = `${MOMO.partnerCode}${timestamp}`;
            const orderId = `${MOMO.partnerCode}-${timestamp}`;
            const orderInfo = 'Thanh toan khoa hoc CodeGrow';
            const redirectUrl = MOMO.returnUrl;
            const ipnUrl = MOMO.notifyUrl;
            const extraData = Buffer.from(
              JSON.stringify({ userId, courseId }),
              'utf8'
            ).toString('base64');
            const requestType = 'payWithMethod';
            const autoCapture = true;
            const lang = 'vi';

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

            const signature = crypto.createHmac('sha256', MOMO.secretKey)
            .update(rawSignature)
            .digest('hex');

            const requestBody = {
              partnerCode: MOMO.partnerCode,
              partnerName: 'CodeGrow Platform',
              storeId: 'CodeGrowStore',
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
              signature
            };

            const response = await axios.post(MOMO.endpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
            });

            if (response.data && response.data.payUrl) {
            return response.data.payUrl;
            } else {
            throw new Error('MoMo payment error: ' + JSON.stringify(response.data));
            }
        }
        throw new BadRequestError('Invalid payment method');
    }
    static momoIpn = async({
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
        signature
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
      console.log('chạy ipn momo');
      
      const expectedSignature = crypto.createHmac('sha256', MOMO.secretKey)
        .update(rawSignature)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.error('Sai chữ ký từ IPN');        
        throw new BadRequestError('Invalid signature')
      }      
      // Step 2: Xử lý giao dịch
      if (resultCode === 0) {        
        console.log('Thanh toán MoMo thành công:');

        const extraDecoded = JSON.parse(Buffer.from(extraData, 'base64').toString('utf8'));
        console.log(extraDecoded);
        
        const { courseId, userId } = extraDecoded;

        await courseModel.findByIdAndUpdate(courseId, {
          $inc: { enrolledCount: 1 }
        });

        await enrollCourseModel.create({
          user: userId,
          course: courseId
        });

      } else {
        console.log('Thanh toán MoMo thất bại:');
        throw new BadRequestError('Transaction failed')        
      }
    }
}
module.exports = paymentService;
