const { default: mongoose } = require("mongoose");

const isDeleteSchema = mongoose.Schema(
    {
        isDeleted: {
            type:Boolean,
            default:false
        }
    }
)
module.exports = isDeleteSchema;