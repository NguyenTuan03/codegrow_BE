const databaseLoader = require("./database.loader");
const middlewareLoader = require("./middleware.loader");
const expressLoader = require('./express.loader');
const routers = require("../routes");
module.exports = async(app) => {
    await databaseLoader();
    expressLoader(app)
    middlewareLoader(app)
    routers(app) 
}