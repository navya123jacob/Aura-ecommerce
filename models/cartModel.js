const mongoose=require('mongoose')
// Define the schema for the Category collection

const cart = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    Products:[{
        products:{
            type : mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required: true
        },
        price:{
            type:Number,
            required:true
        },
        
        name:{
            type:String,
            required:true
        },
        quantity:{
            type:Number,
            default:1,
            required:true
        },
    
        total : {
            type:Number,
            default: 0
        },
    }],
    grandTotal: {
        type:Number,
        default: 0,
        required:true
    },
    
    couponApplied:{
        type:String,
        default:''
    }
})
module.exports = mongoose.model('cart',cart)