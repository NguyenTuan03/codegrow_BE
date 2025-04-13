const { default: mongoose } = require("mongoose");
const isDeleteSchema = require("./isDelete.model");
const {COLLECTION} = require('../configs/user.config')
const userSchema = new mongoose.Schema(
    {
        fullName: {
            type:String,
            required: true,
            trim:true,
            minLength: 5,
            maxLength: 100           
        },
        role: {
            type:String,
            enum: ['Admin','User','QAQC','Mentor'],
            default:'User'
        },
        wallet: { 
            type: Number, 
            default: 0 
        }, 
        email:{
            type:String,
            unique:true,
            trim:true
        },
        password: {
            type:String,
            rquired: true
        },
        isVerified: { 
            type: Boolean, 
            default: false 
        },
        ...isDeleteSchema.obj
    },
    {
        timestamps:true,
        collection:COLLECTION.user
    }
)
module.exports = mongoose.model('User',userSchema)