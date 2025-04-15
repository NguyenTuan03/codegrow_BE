const jwt = require('jsonwebtoken')
const createAccessToken = (attr,secret, expiresIn) => {
    return jwt.sign(attr,secret, {
        expiresIn:expiresIn
    })
}
const createRefreshToken = (attr, secret, expiredIn) => {
    return jwt.sign(attr,secret, {
        expiresIn: expiredIn
    })
}
module.exports = {createAccessToken,createRefreshToken}