const { validFullName, validEmail, validPassword } = require("../../../utils/validator");

class CreateUserDTO {
    constructor(fullName, email, password) {
        this.fullName = fullName,
        this.email = email,
        this.password = password
    }
    async validate() {
        try {
            await validFullName(this.fullName);
            await validEmail(this.email);
            await validPassword(this.password);
        } catch (error) {
            throw error;
        }
    }
} 
module.exports = CreateUserDTO