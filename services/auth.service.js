const UserModel = require('../models/user.model')
const {createAccessToken, createRefreshToken} = require('../utils/auth.util')
const {
    UnauthorizedRequestError,
    InternalServerError,
    BadRequestError
} = require('../core/responses/error.response')
const bcrypt = require('bcrypt')
const { USER_ROLES } = require('../configs/user.config')
const CreateUserDTO = require('../core/dtos/users/create.user.dto')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
class AuthService {
    static logIn = async ({email,password}) => {
        if (!email || !password) throw new BadRequestError('Email and password are required')
        
        const user = await UserModel.findOne({ email }).lean();

        if (!user) throw new UnauthorizedRequestError('Invalid email or password');
        if (user.isDeleted === 'true' || user.isDeleted === true) throw new UnauthorizedRequestError('User is deleted');
        if (!user.isVerified) throw new BadRequestError('Account is not active yet');

        const pass = await bcrypt.compare(password,user.password)        
        
        if (!pass) throw new UnauthorizedRequestError('Invalid email or password')
        const payload = {
            _id: user._id,
            role: user.role,
            name: user.fullName,
        };
        const accessToken = createAccessToken(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_EXPIRES
        )

        const refreshToken = createRefreshToken(
            payload,            
            process.env.REFRESH_TOKEN_SECRET,
            process.env.REFRESH_TOKEN_FORGOT_EXPIRES,
        )        

        if (!accessToken) throw new InternalServerError('Cannot generate access token')
        return { accessToken, refreshToken };

    } 
    static refreshToken = async ({token}) => {
        if (!token) return new UnauthorizedRequestError('No refresh token')
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = createAccessToken({
          _id: decoded._id,
          role: decoded.role,
          name: decoded.name,
        });
        return newAccessToken;
    }
    static logInGoogle = async ({data}) => {                
        const user = await UserModel.findOne({
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
        const newUser =  await UserModel.create({
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
    static signUp = async ({fullName, email,password}) => {
        // const createUserDto = new CreateUserDTO(fullName, email, password);
        // await createUserDto.validate();

        const userHolder = await UserModel.findOne({ email }).lean();
        if (userHolder) throw new BadRequestError("Email already exists");

        const passwordHash = await bcrypt.hash(
            password,
            parseInt(process.env.PASSWORD_SALT)
        );

        const verifyToken = createAccessToken(
        { email },
        process.env.ACCESS_TOKEN_SECRET,
        process.env.ACCESS_TOKEN_EXPIRES
        );

        const newUser = await UserModel.create({
        fullName,
        email,
        password: passwordHash,
        role: USER_ROLES.USER,
        });
        
        const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        });

        const mailOptions = {
        from: `"CODEGROW " <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to CODEGROW! Please verify your email",
        html: `
            <h3>Hello ${fullName},</h3>
            <p>Thanks for signing up! Please click the link below to verify your email address:</p>
            <a href="${process.env.CLIENT_URL}/register/verify?token=${verifyToken}">Verify Email</a>
        `,
        };

        await transporter.sendMail(mailOptions);

        return newUser;
    }
    static VerifyEmail = async ({token,socketId}) => {
        try {
            console.log(token, socketId);
          
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await UserModel.findOne({ email: decoded.email });
        
            if (!user) {
              global.io.to(socketId).emit("verify_Failed", {
                message: "Người dùng không tồn tại!",
              });
              return null; 
            }
            
            if (user.isVerified) {
              global.io.to(socketId).emit("verify_Failed", {
                message: "Tài khoản đã được xác minh trước đó.",
              });
              return null; 
            }
        
            user.isVerified = true;
            await user.save();
            if (socketId && global.io) {
                global.io.to(socketId).emit("verify_success", {
                  message: "Tài khoản đã được xác minh thành công!",
                  email: user.email,
                });
              }
                        
            return user
          } catch (err) {
            console.log(err);            
          }
    }
    static forgotPasswordRequest = async ({email}) => {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) throw new UnauthorizedRequestError('User not found')
        
            const resetToken = jwt.sign(
              { id: user._id },
              process.env.ACCESS_TOKEN_SECRET,
              { expiresIn: process.env.ACCESS_TOKEN_FORGOT_EXPIRES }
            );
        
            const resetLink = `${process.env.CLIENT_URL}/password/reset?token=${resetToken}`;            
            const transporter = nodemailer.createTransport({
              service: "Gmail",
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
              },
            });
        
            const mailOptions = {
              from: `"CODEGROW" <${process.env.EMAIL_USER}>`,
              to: email,
              subject: "Reset Your Password",
              html: `
                <h3>Hello,</h3>
                <p>You requested to reset your password. Click the link below:</p>
                <a href="${resetLink}">Reset Password</a>
                <p>This link will expire in 15 minutes.</p>
              `,
            };
        
            await transporter.sendMail(mailOptions);
            return;            
          } catch (err) {
            console.error(err);            
            throw new InternalServerError('Error sending email')
          }
    }
    static resetPass = async ({token,newpass}) => {
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await UserModel.findById(decoded.id);
        
            if (!user) return res.status(404).json({ message: "User not found" });            
            
            const passwordHash = await bcrypt.hash(newpass,parseInt(process.env.PASSWORD_SALT));
            user.password = passwordHash;
            await user.save();
        
            return;
        } catch (err) {
            console.error(err);            
            throw new UnauthorizedRequestError('Invalid or expired token')
        }
    }
}
module.exports = AuthService