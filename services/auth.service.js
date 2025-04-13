const User = require('../models/user.model')
const {createAccessToken} = require('../utils/auth.util')
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

        const user = await User.findOne({email, isDeleted: false}).lean()        
        if (!user) throw new UnauthorizedRequestError('Invalid email or password')

        const pass = await bcrypt.compare(password,user.password)
        if (!pass) throw new UnauthorizedRequestError('Invalid email or password')
        
        const accessToken = createAccessToken(
            {
                _id: user._id,
                role: user.role,
                name: user.fullName
            },
            process.env.ACCESS_TOKEN_SECRET,
            process.env.ACCESS_TOKEN_EXPIRES
        )
        if (!accessToken) throw new InternalServerError('Cannot generate access token')
        return accessToken;

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
    static signUp = async ({fullName, email,password}) => {
        const createUserDto = new CreateUserDTO(fullName, email, password);
        await createUserDto.validate();

        const userHolder = await User.findOne({ email }).lean();
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

        const newUser = await User.create({
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
        from: `"Your App Name" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Our App! Please verify your email",
        html: `
            <h3>Hello ${fullName},</h3>
            <p>Thanks for signing up! Please click the link below to verify your email address:</p>
            <a href="${process.env.CLIENT_URL}/verify-email?token=${verifyToken}">Verify Email</a>
        `,
        };

        await transporter.sendMail(mailOptions);

        return {
        message: "User registered successfully. Please check your email to verify your account.",
        };
    }
    static VerifyEmail = async ({token}) => {
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findOne({ email: decoded.email });
        
            if (!user) return res.status(404).json({ message: "User not found" });
        
            if (user.isVerified) {
              return res.status(400).json({ message: "User already verified" });
            }
        
            user.isVerified = true;
            await user.save();
        
            return;
          } catch (err) {
            res.status(400).json({ message: "Invalid or expired token" });
          }
    }
}
module.exports = AuthService