const mongoose = require('mongoose');


const articleSchema = new mongoose.Schema({
    
 
    title: String,
    description: String,
    imageUrl: String
   

},  { timestamps: true });



module.exports = mongoose.model('articles', articleSchema);