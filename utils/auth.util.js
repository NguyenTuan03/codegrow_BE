const jwt = require('jsonwebtoken')
const createAccessToken = (attr,secret, expiresIn) => {
    return jwt.sign(attr,secret, {
        expiresIn:expiresIn
    })
}
module.exports = {createAccessToken}