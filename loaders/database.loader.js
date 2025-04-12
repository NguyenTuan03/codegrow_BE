const { default: mongoose } = require("mongoose")
const errorModel = require('../models/error.model')
const databaseLoader = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);  
        console.log("Database connected!");             
    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
}
module.exports = databaseLoader;