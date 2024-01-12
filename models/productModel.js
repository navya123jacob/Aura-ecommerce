const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    min: 0,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true, // Assuming a product must belong to a category
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
  quantity: {
    type: Number,
    min: 0,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  pictures: {
    type: [String], // Assuming pictures is an array of strings (file paths or URLs)
    required: true,
  },
  
    offer:{
        type: Number,
        default: 0,
    },
    offername: {
      type: String,
      default:"",
    }

});

// Create a Product model using the product schema
const Product = mongoose.model('Product', productSchema);

module.exports = Product;