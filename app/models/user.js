var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

//Define the schema for our user model
var userSchema = mongoose.Schema({

    local: {
        email: String,
        password: String
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        firstName: String,
        familyName: String
    }
});

//Generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Checking if password is valid
userSchema.methods.isValidPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

//Creation of the user model and export it
module.exports = mongoose.model('User', userSchema);
