const {Attendance} = require('../models/attendance')
const {User} = require('../models/users')
const express = require('express');
const mongoose = require('mongoose');
const {auth} = require('../middleware/auth')

const router = express.Router();

//Mark Attendances
router.post('/', auth , async(req,res) => {
    try {
        const user = await User.findById(req.user.id)
    if(!user) return res.status(400).send('User not logged in')

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const endOfDay = new Date();
    endOfDay.setHours(23,59,59,999);

    const check = await Attendance.findOne({
        user: req.user.id,
        date: {$gte : startOfDay ,$lte: endOfDay}
    })
    if(check) return res.status(403).send('Not allowed to mark attendance more than one time in a day')

    const attendance = new Attendance({
        user: req.user.id,
        date: Date.now(),
        statusofAttendance: req.body.statusofAttendance || 'present'
    })

    await attendance.save();
    res.status(201).send(attendance)  

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal server error')
    }

    })

    //Get record of Attendance
    router.get('/record', auth , async(req,res) => {
        try {
            const record = await Attendance.find({user: req.user.id}).sort('-date')
            if(!record.length) res.status(400).send('No attendance record found')
    
                res.send(record)
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Internal server error')
        }
    })

    module.exports = router
    
