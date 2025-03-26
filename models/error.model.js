const { default: mongoose } = require("mongoose");
const isDeleteSchema = require('./isDelete.model')

const errorSchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        file: {
            type: String,
            required: true
        },
        function: {
            type: String,
            required: true
        },
        stacktrace: {
            type: String,
            required: true
        },
        ...isDeleteSchema.obj
    },
    {
        timestamps: true,
        collection:"Errors"
    }
)
module.exports = mongoose.model('Error',errorSchema)