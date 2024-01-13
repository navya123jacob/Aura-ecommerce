const mongoose=require('mongoose')
// Define the schema for the Category collection
const categorySchema=new mongoose.Schema({
    name: {
        type: String,
        unique: true, //This ensures that no twocategory documents in the User collection can have the category name.
        required:true
      },
      description: {
        type: String,
        required: true,
      },
    status:{
        type:String,
        enum:['active','blocked'],
        default:'active'
    },
  
    offer:{
        type: Number,
        default: 0,
    },
    offername: {
      type: String,
      default:"",
    }


})

// Create the Category model using the schema
const Category=mongoose.model('Category',categorySchema)
module.exports=Category

