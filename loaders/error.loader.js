const { handleErrorResponse } = require("../utils/response");

const errorResponse = async (app) => {
    app.use(handleErrorResponse);
}
module.exports = errorResponse;