const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UserSchema = new Schema({
    username: {type: String, requred: true, min: 4, unique: true},
    password: {type: String, requred: true},
})

const UserModel = model('User', UserSchema);

moduel.exports = UserModel;