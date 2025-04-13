const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'trips', 
  },
  bagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'bags', 
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories', 
  },
    name: { type: String, trim: true},
    qty: { type: Number, min: 1 },
    description: { type: String, trim: true },
    weightOption: {type: String },
    weight: { type: Number, min: 0.1 },
    priority: { type: String, trim: true, default: "low" },
    link: String,
    worn: {type: Boolean, default: false},
    imageUrl: { type: String, default: null },
    order: {type: Number, default: null, index: true},
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users"
      }
   
}, { timestamps: true })


itemSchema.index({ owner: 1, tripId: 1, bagId: 1, categoryId: 1 });



module.exports = mongoose.model('items', itemSchema);



