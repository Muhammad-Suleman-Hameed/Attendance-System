const {Leave} = require('../models/leave');
const express = require('express');
const mongoose = require('mongoose');
const {auth} = require('../middleware/auth')

const router = express.Router();

router.post('/', auth , async(req, res) => {
try {
        const {startDate, endDate, reason} = req.body;

        if(new Date(startDate) > new Date(endDate))
            return res.status(400).send('End date must be after start date')

        if( !startDate || !endDate || !reason)
            return res.status(400).send('All fields are required');
        
        const duplicateleave = await Leave.findOne({
            user: req.user.id,
            $or: [
                {startDate: {$lte:endDate, $gte:startDate}},
                {endDate: {$lte:endDate, $gte:startDate}},
                {startDate: {$lte:startDate, $gte:endDate}}
            ]
        })
        if (duplicateleave) 
            return res.status(400).send('Leave request for these dates already exits')

        const leave = new Leave({
            user: req.user.id,
            startDate,
            endDate,
            reason,
        })
    
        await leave.save();
        res.status(201).send('Leave request is submitted.')
} 
catch (error) {
    console.error(error.message)
    res.status(500).send('Internal Server error')
}
})

module.exports = router