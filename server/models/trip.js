const mongoose = require('mongoose');
const Bag = require('./bag')
const Category = require('./category')
const Item = require('./item')


const tripSchema = new mongoose.Schema({
    
    name: { type: String, trim: true },
    country: {type: String, trim: true},
    about: { type: String, trim: true },
    distance: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    imageUrl: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users"
      }
   

},  { timestamps: true });

tripSchema.index({ owner: 1 }); 
tripSchema.index({ name: 1 });

tripSchema.pre('findOneAndDelete', async function (next) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      await Promise.all([
        Bag.deleteMany({ tripId: doc._id }),
        Category.deleteMany({ tripId: doc._id }),
        Item.deleteMany({ tripId: doc._id }),
      ]);
    }
    next();
  } catch (error) {
    console.error('Error in pre-hook for findOneAndDelete:', error);
    next(error);
  }
});


module.exports = mongoose.model('trips', tripSchema);