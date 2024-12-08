const {User , generateAuthToken} = require('../models/users')
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
const Joi = require('joi')

const router = express.Router();

router.post('/',  async(req,res) => {
    const {error} = validatetUser(req.body)
    if(error) return res.status(400).send(error.details[0].message) 

    const user = await User.findOne({email:req.body.email})
    if(!user) return res.status(400).send('Invalid email or password')

    const validPassword = await bcrypt.compare(req.body.password , user.password)
    if(!validPassword) return res.status(400).send('Invalid email or password')

    const token = user.generateAuthToken()
    res.status(201).send({token})   
    })

function validatetUser(user){
        const schema = Joi.object({
            email: Joi.string().min(5).max(200).email().required(),
            password: Joi.string().min(3).max(255).required()
        })
        return schema.validate(user)
    }

module.exports = router
    
