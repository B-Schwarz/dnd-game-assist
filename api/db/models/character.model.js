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
    },
    primary: {
        type: Boolean,
        default: false
    },
    // A single uploaded document (pdf/docx/txt) kept on disk under
    // attachments/<charID>. Only the metadata lives here, so the sheet's bulk
    // autosave (which only touches `character`) never clobbers it.
    attachment: {
        name: String,
        mime: String
    }
});


//Create Model
const Character = mongoose.model('Character', CharacterSchema);

//Export Model
module.exports = { Character };

