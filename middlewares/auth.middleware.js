const { UnauthorizedRequestError } = require("../core/responses/error.response");
const jwt = require('jsonwebtoken')
const AuthMiddleware = async (req,res,next) => {
    try {
        const {authorization} = req.headers;
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {            
            throw new UnauthorizedRequestError('Missing or invalid Authorization header')
        }

        if (!authorization) {
            throw new UnauthorizedRequestError("Authorization header is required");
        }
        console.log("authorization ",authorization);
        const token = authorization.split(' ')[1];
        const {_id,role} = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )
        req.userId = _id;
        req.role = role;
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new UnauthorizedRequestError("Token is expired");
          } else if (error.name === "JsonWebTokenError") {
            throw new UnauthorizedRequestError("Token is invalid");
          }
          throw error;
    }
}

module.exports = AuthMiddleware