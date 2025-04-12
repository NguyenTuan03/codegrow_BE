const User = require('../models/user.model')
const {createAccessToken} = require('../utils/auth.util')
const {
    UnauthorizedRequestError,
    InternalServerError
} = require('../core/responses/error.response')
const bcrypt = require('bcrypt')
const { USER_ROLES } = require('../configs/user.config')
class AuthService {
    static logIn = async ({}) => {

    }
    static logInGoogle = async ({data}) => {                
        const user = await User.findOne({
            email:data.email
        }).lean()
        console.log(user);        
        if (user) {            
            if (user.isDeleted === "true" || user.isDeleted === true) {
                throw new UnauthorizedRequestError('User is deleted')
            } else {  
                const accessToken = createAccessToken({
                    _id:user._id,
                    role:user.role,
                    name: user.fullName,
                    email: user.email
                },
                process.env.ACCESS_TOKEN_SECRET,
                process.env.ACCESS_TOKEN_EXPIRES)
                return accessToken  
            }
        }
        const newUser =  await User.create({
            fullName: `${data.name.givenName} ${data.name.familyName}`,
            email:data.email,
            password: await bcrypt.hash(
                data.email +
                data.fullName + 
                data.picture + 
                USER_ROLES.USER + 
                process.env.ACCESS_TOKEN_SECRET,
                parseInt(process.env.PASSWORD_SALT)           
            ),
            role: USER_ROLES.USER,
            avatar: data.picture || data.photo,
            isVerified: true
        })
        const accessToken = createAccessToken({
            _id:newUser._id,
            role:newUser.role,
            name: newUser.fullName,
            email: newUser.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRES)
        if (!accessToken) throw new InternalServerError("Server error")
        return accessToken;
    }
}
module.exports = AuthService