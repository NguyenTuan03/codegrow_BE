const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");
const { COLLECTION } = require("../configs/user.config");

const categorySchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required:true
        },
        ...isDeleteSchema.obj
    },
    {
        timestamps:true,
        collection:COLLECTION.category
    }
)
module.exports = mongoose.model('Category',categorySchema)