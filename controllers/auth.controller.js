
const { OK, CREATED } = require("../core/responses/success.response")
const AuthService = require('../services/auth.service')
class AuthController {
    async logIn(req,res) {
    
    }
    async logInGoogle(req,res) {
        console.log(req.user);        
        new OK({
            message: 'Log in successfully',
            metadata: await AuthService.logInGoogle({data:req.user})
        }).send(res)
    }
    async signUp(req,res) {
        new CREATED({
            message:'Sign up successfully',
            metadata: await AuthService.signUp(req.body)
        })
    }
    async Verify(req,res) {
        new CREATED({
            message: 'Verify successfully',
            metadata: await AuthService.VerifyEmail(req.body)
        })
    }
    async forgotPassword(req,res) {
        new CREATED({
            message:'Reset email sent',
            metadata: await AuthService.forgotPasswordRequest(req.body)
        })
    }
    async resetPassword(req,res) {
        new CREATED({
            message:'Reset password successfully',
            metadata:await AuthService.resetPass(req.body)
        })
    }
}
module.exports = new AuthController()