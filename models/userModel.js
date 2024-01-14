const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    Fname:{
        type:String,
        required:true
    },
    Lname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mno:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        required:true
    },
    is_Admin:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Boolean,
        required:true
    },
    
    wallet:{
        type:Number,
        default: 0
    },
    
    walletHistory:[{
        amount: {
            type: Number,
           
        },
        
        description: {
            type: String,
            
        },
        date: {
            type: Date,
            default:Date.now()
            
        }
        ,
        status: {
            type: String,
            
        }

    }],
    addressField: [{
        name: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        
        address: {
            type: String,
            required: true
        },

        district: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true,
            enum: [
                'Andhra Pradesh',
                'Arunachal Pradesh',
                'Assam',
                'Bihar',
                'Chhattisgarh',
                'Goa',
                'Gujarat',
                'Haryana',
                'Himachal Pradesh',
                'Jharkhand',
                'Karnataka',
                'Kerala',
                'Madhya Pradesh',
                'Maharashtra',
                'Manipur',
                'Meghalaya',
                'Mizoram',
                'Nagaland',
                'Odisha',
                'Punjab',
                'Rajasthan',
                'Sikkim',
                'Tamil Nadu',
                'Telangana',
                'Tripura',
                'Uttar Pradesh',
                'Uttarakhand',
                'West Bengal'
              ]
        },
        
        pincode: {
            type: Number,
            required: true
        }
    }]


})
userSchema.index({ Fname: 'text' });
const User=mongoose.model('User',userSchema)
module.exports=User


// In Mongoose, the model name is typically used to determine the collection name in MongoDB. By default, Mongoose will use the lowercase, pluralized version of the model name as the collection name.

// In your case, the model name is "User," and Mongoose will automatically use the pluralized version "users" as the collection name. This behavior is part of Mongoose's conventions.


