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
    addressField:[{
        name:{
            type:String,
            required:true
        },
        phone:{
            type:String,
            required:true
        },
        state:{
            type : String,
            required:true  
        },
        district:{
            type:String,
            required:true
        },
        town:{
            type:String,
            required:true
        },
        pincode:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        }
    }]



})
const User=mongoose.model('User',userSchema)
module.exports=User


// In Mongoose, the model name is typically used to determine the collection name in MongoDB. By default, Mongoose will use the lowercase, pluralized version of the model name as the collection name.

// In your case, the model name is "User," and Mongoose will automatically use the pluralized version "users" as the collection name. This behavior is part of Mongoose's conventions.


