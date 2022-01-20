const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const {v4: uuidv4} = require('uuid');

//Define a schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        trim: true,
        required: true,
        unique: true
    },
    master: {
      type: Boolean,
      required: true
    },
    admin: {
        type: Boolean,
        required: true
    },
    character: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character'
    }],
    password: {
        type: String,
        required: true
    },
    session: [{
        token: {
            type: String
        }
    }]
});

UserSchema.pre('save', function (next) {
    let user = this
    let costFactor = 10

    if (user.isModified('password')) {
        user.password = bcrypt.hashSync(user.password, costFactor)
    }

    next()
})

UserSchema.methods.generateSession = async function () {
    const user = this

    const id = uuidv4()

    user.session.push({token: id})
    await user.save()

    return id
}

UserSchema.statics.findByCredentials = function (name, password) {
    let User = this;
    return User.findOne({
        name: {
            $regex : new RegExp(name, "i") }
    }).then((user) => {
        if (!user)
            return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) resolve(user);
                else reject();
            })
        })
    });
}

//Create Model
const User = mongoose.model('User', UserSchema);

//Export Model
module.exports = {User};

