const mongoose = require('mongoose');
const {Mongoose} = require("mongoose");

//Define a schema
const EncounterSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    encounter: [{
        monster: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Monster'
        },
        hidden: {
            type: Boolean,
            default: false
        },
        amount: {
            type: Number,
            default: 1
        }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

//Create Model
const Encounter = mongoose.model('Encounter', EncounterSchema);

//Export Model
module.exports = {Encounter};

