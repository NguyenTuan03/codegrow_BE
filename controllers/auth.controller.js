
const { OK } = require("../core/responses/success.response")
const AuthService = require('../services/auth.service')
class AuthController {
    async logIn(req,res) {
    
    }
    async logInGoogle(req,res) {
        new OK({
            message: 'Log in successfully',
            metadata: await AuthService.logInGoogle({data:req})
        }).send(res)
    }
}
module.exports = new AuthController()