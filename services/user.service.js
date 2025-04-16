const { USER_ROLES } = require("../configs/user.config")
const { NotFoundRequestError, BadRequestError } = require("../core/responses/error.response")
const userModel = require("../models/user.model")
const { getAllUsers } = require("../repositories/user.repo")
const bcrypt = require('bcrypt')
class UserService {
    static getAllUser = async({limit, sort, page, filter, select}) => {
        return await getAllUsers({limit, sort, page, filter, select})
    }
    static getUserById = async({id}) => {
        const user = await userModel.findOne({_id:id}).lean()
        if (!user) {
            throw new NotFoundRequestError('User not found')
        }
        return user
    }
    static createUser = async({ fullName, email,password, role }) => {
        const user = await userModel.findOne({email}).lean()
        if (user) {
            throw new BadRequestError('Email already exist')
        }
        const hashPass = await bcrypt.hash(
            password,
            parseInt(process.env.PASSWORD_SALT)
        )
        await userModel.create({
            fullName,
            role: role || USER_ROLES.USER,
            wallet:0,
            email,
            password:hashPass,
            isVerified: true
        })
        return;
    }
    static updateUser = async({ id, fullName, email, role }) => {
        const user = await userModel.findById(id).lean()
        if (!user) {
            throw new NotFoundRequestError('User not found')
        }
        await userModel.updateOne({_id:id}, {
            fullName: fullName || user.fullName,
            email: email || user.email,
            role: role || user.role
        })
        return;
    }
    static deleteUser = async ({id}) => {
        const user = await userModel.findOne({
            _id:id,
            isDeleted: false
        }).lean()
        if (!user) {
            throw new NotFoundRequestError('User not found')
        }
        await userModel.updateOne(
            {_id:id},
            {isDeleted: true}
        )
        return user
    }
}
module.exports = UserService