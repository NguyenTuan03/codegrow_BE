const { OK } = require("../core/responses/success.response")
const UserService = require("../services/user.service")

class UserController {
    getAllUsers = async (req,res) => {
        new OK({
            message:'Get all users successfully',
            metadata: await UserService.getAllUser()
        })
    }
}
module.exports = new UserController()