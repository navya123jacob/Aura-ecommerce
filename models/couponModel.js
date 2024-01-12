const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
  couponName:{
    type:String,
    required:true
  },
  couponCode:{
    type:String,
    required:true,
    unique: true,
  },
  discountPercent:{
    type:Number,
    required:true
  },
    minAmount:{
    type:Number,
    required:true
  },
  couponDescription:{
    type:String,
    required:true
  },
  Availability:{
    type:Number,
   
  },
  expiryDate:{
    type:Date,
  },
  status:{
    type:Boolean,
    default:true
  },
  userUsed : [{
       user_id:{
       type : mongoose.Types.ObjectId,
       ref :'User'
       }
       
      
    }],
},{timestamps:true})

couponSchema.pre('find', async function () {
  const currentDate = new Date();
  await this.model.updateMany(
      { expiryDate: { $lt: currentDate }, status: true },
      { $set: { status: false } }
  );
});//pre middleware is a feature that allows you to define functions that are executed before or after certain operations on your documents or models
module.exports = mongoose.model('Coupon',couponSchema)