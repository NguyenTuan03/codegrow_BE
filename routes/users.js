var express = require('express');
const { catchAsyncHandle } = require('../middlewares/error.middleware');
const AuthMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
var router = express.Router();
router.get('/',
    catchAsyncHandle(userController.getAllUsers)
)
module.exports = router;