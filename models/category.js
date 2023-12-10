const mongoose=require(mongoose)
// Define the schema for the Category collection
const categorySchema=new mongoose.Schema({
    name:{
        type:String,
         required:true
    },
    status:{
        type:String,
        required:true
    }

})

// Create the Category model using the schema
const Category=mongoose.model('Category',categorySchema)
module.exports=Category

