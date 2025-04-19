
const { OK, CREATED } = require("../core/responses/success.response")
const AuthService = require('../services/auth.service')
class AuthController {
    async logIn(req,res) {
        const { accessToken,refreshToken } = await AuthService.logIn(req.body);
        res.cookie('sessionId',refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000, 
          })
        new OK({
            message: 'Log in successfully',
            metadata: accessToken
        }).send(res)
    }
    async refreshToken(req,res) {        
        new CREATED({
            message:'New access token',
            metadata: await AuthService.refreshToken(req.cookies.refreshToken)
        })
    }
    async logInGoogle(req,res) {
        console.log(req.user);        
        const accessToken = await AuthService.logInGoogle({data:req.user})
        res.redirect(`${process.env.CLIENT_URL}?token=${accessToken}`);
    }
    async signUp(req,res) {
        new CREATED({
            message:'User registered successfully. Please check your email to verify your account.',
            metadata: await AuthService.signUp(req.body)
        }).send(res)
    }
    async Verify(req,res) {        
        new CREATED({
            message: 'Verify successfully',
            metadata: await AuthService.VerifyEmail(req.body)
        }).send(res)
    }
    async forgotPassword(req,res) {
        new CREATED({
            message:'Reset email sent',
            metadata: await AuthService.forgotPasswordRequest(req.body)
        }).send(res)
    }
    async resetPassword(req,res) {
        new CREATED({
            message:'Reset password successfully',
            metadata:await AuthService.resetPass(req.body)
        }).send(res)
    }    
    async ChangePassword(req,res) {        
        new OK({
            message:'Change password successfully',
            metadata:await AuthService.ChangePassword({
                userId: req.userId,
                ...req.body
        })
        }).send(res)
    }
}
module.exports = new AuthController()