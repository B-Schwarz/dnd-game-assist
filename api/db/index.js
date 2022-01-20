const mongoose = require('mongoose');


//Create connection
const connectDB = async () => {
    await mongoose.connect('mongodb://localhost:27017/dnd').then(() => {
            console.log("Erfolgreiche Datenbankverbindung")

    }).catch((e) => {
        console.error(e)
    })
}

module.exports = {
    connectDB
}
