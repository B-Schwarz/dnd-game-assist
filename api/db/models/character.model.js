const mongoose = require('mongoose');

//Define a schema
const CharacterSchema = new mongoose.Schema({
    character:{
        type: Object,
        required: true
    }
});


//Create Model
const Character = mongoose.model('Character', CharacterSchema);

//Export Model
module.exports = { Character };

