const mongoose = require('mongoose');
const Category = require('./category')
const Item = require('./item')

const bagSchema = new mongoose.Schema({
    
    tripId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'trips'
    },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    goal: { type: String, min: '0' },
    passed: { type: Boolean, default: false },
    likes: { type: Number, default: 0, min: 0 },
    exploreBags: {type: Boolean, default: false},
    imageUrl: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users"
      }

},  { timestamps: true });

bagSchema.index({ owner: 1, tripId: 1 });
bagSchema.index({ name: 1 });


bagSchema.pre('findOneAndDelete', async function (next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
    await Category.deleteMany({ bagId: doc._id });
    await Item.deleteMany({ bagId: doc._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('bags', bagSchema);