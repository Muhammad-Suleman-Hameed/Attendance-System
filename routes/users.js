const {User , generateAuthToken, validate} = require('../models/users')
const path = require('path')
const express = require('express');
const mongoose = require('mongoose');
const _ = require('lodash')
const bcrypt = require('bcryptjs')
const {auth} = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs')
 
const router = express.Router();

//Current User
router.get(('/:me') , auth ,  async (req, res) => {
   try {
    const user = await User.findById(req.user.id).select('-password')
    if(!user) res.status(400).send('User not found')

        res.send(user)
   } 
   
   catch (error) {
    console.error(error.message)
    res.status(500).send('Internal server error')
   } 
    
})

//Register
router.post(('/') ,upload.single('image'),  async (req, res) => {
    try {
        const imagePath = req.file ? req.file.path: null
    
        const {error} = validate(req.body);
        if(error) return res.status(400).send(error.details[0].message)
    
        const duplicateEmail = await User.findOne({email:req.body.email})
        if (duplicateEmail) return res.status(400).send('User already exists with same Email')
        
        const user = new User({
            ...req.body,
            image: imagePath
        }
        )
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password , salt)
    
        await user.save()
    
        const token = user.generateAuthToken();
        res.header('x-auth-token' , token).send(_.pick(user , ['name' , 'email' ]))
    } 
    catch (error) {
        console.log(error.messsage)
        res.status(400).send('Internal server error') 
    }
})

//Updating profile picture
router.put('/updateprofile' , auth , upload.single('image') , async(req, res) => {
    try {
        if (!req.file) return res.status(400).send('No file uploaded');

        const user = await User.findById(req.user.id)
        if(!user) return res.status(404).send('User not found')
    
            if(user.image){
                const oldpath = path.join(__dirname , '../middleware/public' ,  user.image);
                console.log(`Old image path: ${oldpath}`);
                if (fs.existsSync(oldpath)){ 
                    fs.unlinkSync(oldpath)
                }
            }
            
            user.image = req.file.filename
            await user.save()
            console.log('Profile picture updated:', user);
            res.send('Profile Pic updated successfully')
    } 
    catch (error) {
        console.error(error.messsage)
        res.status(400).send('Internal server error') 
    }

})


module.exports = router