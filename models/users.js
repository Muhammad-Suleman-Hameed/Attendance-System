const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Joi = require('joi')
const { isAdmin } = require('../middleware/isAdmin')

const userSchema =  new mongoose.Schema({
    name: {type: String , required: true , minlength: 3 , maxlength: 200},
    image: {type: String },
    email: {type: String , required: true , unique: true},
    password: {type: String , required: true , minlength: 3 , maxlength: 255 },
    isAdmin: {type:Boolean, default:false}
})

userSchema.methods.generateAuthToken = function(){
    const token =  jwt.sign({id: this.id , isAdmin: this.isAdmin} , process.env.JWT_PRIVATE_KEY)
    return token;
}

const User = mongoose.model('User' , userSchema);

function validateUser(user){
    const schema = Joi.object({
        name: Joi.string().min(3).max(200).required(),
        email: Joi.string().min(5).max(200).email().required(),
        password: Joi.string().min(3).max(255).required()
    }) 
    return schema.validate(user);
}

exports.validate = validateUser;
exports.userSchema = userSchema;
exports.User = User;