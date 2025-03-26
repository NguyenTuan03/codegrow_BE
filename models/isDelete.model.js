const { default: mongoose } = require("mongoose");

const isDeleteSchema = mongoose.Schema(
    {
        isDeleted: {
            type:String,
            default:false
        }
    }
)
module.exports = isDeleteSchema;