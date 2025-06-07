var express = require('express');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const messageController = require('../controllers/message.controller');
const AuthMiddleware = require('../middlewares/auth.middleware');
var router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
router.get('/users',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(messageController.getUsersForSideBar)
)
router.get('/:id',
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(messageController.getMessages)
)
router.post('/send/:id',
    upload.single('image'),
    catchAsyncHandle(AuthMiddleware),
    catchAsyncHandle(messageController.sendMessage)
)
module.exports = router;