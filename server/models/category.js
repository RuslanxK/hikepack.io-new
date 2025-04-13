const mongoose = require('mongoose');
const Item = require('./item');

const categorySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'trips', // Assuming `trips` is the collection name
    },
    bagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'bags', // Assuming `bags` is the collection name
    },
    name: { type: String, trim: true },
    order: { type: Number, default: null, index: true },
    color: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { timestamps: true } 
);

categorySchema.index({ bagId: 1, owner: 1 });

categorySchema.pre('findOneAndDelete', async function (next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      await Item.deleteMany({ categoryId: doc._id });
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('categories', categorySchema);
