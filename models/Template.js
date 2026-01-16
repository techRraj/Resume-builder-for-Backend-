// backend/models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  // ✅ Use 'id' as a STRING (not _id)
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['free', 'premium', 'vip'], 
    default: 'free' 
  },
  thumbnail: String,
  description: String,
  colors: {
    primary: String,
    secondary: String,
    background: String,
    text: String
  },
  layout: String,
  features: [String],
  // ✅ Store price as a NUMBER (not nested object)
  price: { type: Number, default: 0 }
}, {
  // ✅ Disable auto _id so we can use custom string id
  _id: false,
  timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);