const mongoose = require('mongoose');

//Define a schema
const CharacterSchema = new mongoose.Schema({
    character:{
        type: Object,
        required: true
    },
    npc: {
        type: Boolean,
        default: false
    }
});


//Create Model
const Character = mongoose.model('Character', CharacterSchema);

//Export Model
module.exports = { Character };

