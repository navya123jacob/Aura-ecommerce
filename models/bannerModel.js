const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  image: {
    type: [String], // Assuming each image path is a string
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  occasion: {
    type: String,
    required: true, //location
  },
  status: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("banner", bannerSchema);
