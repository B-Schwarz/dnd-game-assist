const mongoose = require('mongoose');
const {User} = require("./models/user.model");


//Create connection
const connectDB = async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.DB_URI).then(() => {
        console.log("Erfolgreiche Datenbankverbindung")
        User.find()
            .then(u => {
                if (u.length === 0) {
                    User({
                        name: 'admin',
                        password: 'asdasdasd',
                        master: false,
                        admin: true
                    }).save()
                    console.error('Standard Admin created')
                }
            })
    }).catch((e) => {
        console.error(e)
    })
}

module.exports = {
    connectDB
}
