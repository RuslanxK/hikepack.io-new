const mongoose = require('mongoose');


const changeLogSchema = new mongoose.Schema({
    
 
    title: String,
    description: String
   

},  { timestamps: true });



module.exports = mongoose.model('changelog', changeLogSchema);