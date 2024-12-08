const {User} = require('../models/users');
const {Attendance} = require('../models/attendance');
const { isAdmin } = require('../middleware/isAdmin');
const {auth} = require('../middleware/auth');
const express = require('express');
const router = express.Router();

router.get('/students', auth , isAdmin , async(req, res) => {
   try {
     const students = await Attendance.find()
     .populate('user' ,'name email')
     if(!students || students.length === 0)
      res.status(500).send('No record found') 
      //console.log(students)
      res.send(students)
   } 
   catch (error) {
    console.error(error.message)
    res.status(500).send('Internal server error')
   }
})

//module.exports = router