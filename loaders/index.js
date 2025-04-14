const databaseLoader = require("./database.loader");
const middlewareLoader = require("./middleware.loader");
const expressLoader = require('./express.loader');
const setupSocket = require('./socket.loader')
const routers = require("../routes");
module.exports = async(app,server) => {
    console.log("🔧 Loading database...");
    await databaseLoader();

    console.log("🔧 Loading express...");
    expressLoader(app);

    console.log("🔧 Loading middleware...");
    middlewareLoader(app);

    console.log("🔧 Loading routers...");
    routers(app);

    console.log("🧩 Loading socket...");
    setupSocket(server); 
    console.log("✅ Socket loader loaded!");
}