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
                    // Never seed a publicly-known password in production. Take it
                    // from ADMIN_INITIAL_PASSWORD; only fall back to the dev
                    // default off-prod (the e2e suite logs in as admin/asdasdasd).
                    const seedPassword = process.env.ADMIN_INITIAL_PASSWORD
                        || (process.env.NODE_ENV === 'production' ? null : 'asdasdasd')
                    if (!seedPassword) {
                        console.error('No default admin seeded: set ADMIN_INITIAL_PASSWORD to bootstrap the first admin.')
                        return
                    }
                    User({
                        name: 'admin',
                        password: seedPassword,
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
