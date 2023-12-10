const mongoose=require('mongoose')

const userOTPverifySchema=new mongoose.Schema({
    userId:String,
    otp:String,
    createdAt:Date,
    expiresAt:Date
})
const OTPverify=mongoose.model('UserOTP',userOTPverifySchema)
module.exports=OTPverify