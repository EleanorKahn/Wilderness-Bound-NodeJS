const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    //purpose of emtpy string fields is to demonstrate how we can use mongoose population to pull info from user docs and populate the comments subdocs
    firstname: {
        type: String,
        default: "",
    },
    lastname: {
        type: String,
        default: "",
    },
    admin: {
        type: Boolean,
        default: false
    },
    facebookId: {
        type: String,
    }
});

//gets rid f the need for the schema to contain a username and password fields, along with salting and hashing the password
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);