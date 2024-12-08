const {User , generateAuthToken,validate} = require('../models/users')
const { isAdmin } = require('../middleware/isAdmin');
const {Attendance} = require('../models/attendance');
const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs')
const {auth} = require('../middleware/auth');
const { reset } = require('nodemon');
const { default: mongoose } = require('mongoose');
const {Grading} = require('../models/grading')


const router = express.Router()

//SignUp
router.post('/signUp' , async(req,res) => {
    try {
    const {error} = validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)   
       
    const {name, email, password} = req.body;

    const user = await User.findOne({email})
    if(user) return res.status(400).send('This email is alredy registered')

    const newUser = new User({
        name,
        email,
        password,
        isAdmin: true
    })

    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password , salt)

    await newUser.save()

    const token = newUser.generateAuthToken()
    res.header('x-auth-token', token).send({name, email, isAdmin: newUser.isAdmin})

    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal Server error')
    }
    })

//Login
router.post('/logIn', async(req,res) => {
        try {
        const {error} = validateUser(req.body)
        if(error) return res.status(400).send(error.details[0].message)     

        const {email, password} = req.body;
    
        const user = await User.findOne({email})
        if(!user) return res.status(400).send('Invalid email or password')
    
        const validPassword = await bcrypt.compare(password , user.password)
        if(!validPassword) return res.status(400).send('Invalid email or password')

        const token = user.generateAuthToken()
        res.send({token})
    
        } catch (error) {
            console.error(error.message)
            res.status(500).send('Internal Server error')
        }
        })

function validateUser(user){
    const schema = Joi.object({
        email: Joi.string().email().min(5).max(200).required(),
        password: Joi.string().min(3).max(255).required()
    })
    return schema.validate(user)
}
    
//View all the record of login students
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

//Adding a new attendance of a student
router.post('/attendance', auth , isAdmin , async(req, res) => {
    try {
        const {error} = validateAttendance(req.body)
        if(error) return res.status(401).send(error.details[0].message)
    
            const {user, date, statusofAttendance} = req.body;
    
            const userValid = await User.findById(user)
            if(!userValid) return res.status(401).send('User does not exists')
    
            const startOfDay = new Date(date);
            startOfDay.setHours(0,0,0,0)
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23,59,59,999)
    
            const check = await Attendance.findOne({
                user,
                date: { $gte: startOfDay , $lte: endOfDay}
            })
    
            if(check) return res.status(403).send('Not allowed to mark attendance more than one time in a day')
    
        const newAttendance = new Attendance({
           user,
           statusofAttendance,
           date
        })
    
        await newAttendance.save();
        res.status(201).send(newAttendance)
    } 
    catch (error) {
    console.error(error.message)
     res.status(500).send('Internal server error')
    }

})


function validateAttendance(user){
    const schema = Joi.object({
        user: Joi.string().required(),
        date: Joi.date().required(),
        statusofAttendance: Joi.string().valid('absent','present','leave').required()
    })
    return schema.validate(user)
}

//Delete attendance of a student
router.delete('/attendance/:id' , auth , isAdmin , async(req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id)
        console.log(req.params.id)
        if(!attendance) return res.status(404).send('Record does not exists')
    
            res.send('Attendance record deleted succesfully')
    } 
    catch (error) {
    console.error(error.message)
    res.status(500).send('Internal server error')
    }
})

//Update attendance of a student
router.put('/attendance/:id' , auth , isAdmin , async(req, res) => {
    try {
        const {error} = validatestatus(req.body)
        if(error) return res.status(404).send(error.details[0].message)
    
            const {id} = req.params;
            const {date, statusofAttendance} = req.body;
    
        const user = await Attendance.findById(id)
        if(!user) return res.status(404).send('Record does not exists')
    
        if(date) user.date = date
        if(statusofAttendance) user.statusofAttendance = statusofAttendance   
    
        await user.save()
        res.send('Attendance record updated successfully')
    } 
    catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error')
    }
        
})

function validatestatus(user){
    const schema = Joi.object({
        date: Joi.date().required(),
        statusofAttendance: Joi.string().valid('absent','present','leave').required()
    })
    return schema.validate(user)
}

//To show specific user attendance (from date to to date)
router.get('/attendance/:id' , auth , isAdmin , async(req, res) => {
    try {

        const{from , to} = req.query;
        if( !from || !to) return res.status(404).send("Provide the dates for which you want to generate the report")

        const dateFrom = new Date(from);
        const dateTo = new Date(to);

        if( isNaN(dateFrom) || isNaN(dateTo)) return res.status(404).send("Invalid 'from' or 'to' date format. Use 'YYYY-MM-DD'.")

        const userId = new mongoose.Types.ObjectId(req.params.id);

        const attendance = await Attendance.find({
            user: userId ,
            date: {$gte: dateFrom, $lte: dateTo}
        })
        .sort('date')

        if(!attendance) return res.status(404).status('Record does not exists');
    
        res.send(attendance);
    } 
    catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error')
    }
})

//Leave Approval Module
router.put('/leaveStatus/:id' , auth , isAdmin , async(req, res) => {
    try {
        const {id} = req.params;
        const {leaveStatus} = req.body;

        if(!['approved', 'rejected'].includes(leaveStatus))
            return res.status(400).send("Leave status must be : ['approved', 'rejected'] ")
        
        const updateStatus = await Attendance.findByIdAndUpdate(
            id,
            {leaveStatus},
            {new: true}
        )
        if(!updateStatus) return res.status(404).send("Record not found.")

        res.send(updateStatus)
    } 
    catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error')
    }    
})

//Count of attendance statuses of a student
router.get('/leaveCount/:id' , auth , isAdmin , async(req, res) => {
    try {
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).send("Invalid user ID format");
        } 

        const userId = new mongoose.Types.ObjectId(id)
       
        const attendance = await Attendance.find({user: userId})

        if (attendance.length === 0) {
            return res.status(404).send({
                message: 'No attendance record exists',
                summary: { present: 0, leave: 0, absent: 0 },
            });
        }

        const summary = {
            present: 0,
            leave: 0,
            absent: 0
        }
       
       for(let i = 0; i < attendance.length; i++){
        const record = attendance[i];
        if(summary[record.statusofAttendance] !== undefined)
            summary[record.statusofAttendance]++
       }
        
        res.send(summary)
    } 
    catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error')
    }       
})

//Complete System Report FROM and TO dates of all attendances
router.get('/leaveReports' , auth , isAdmin , async(req, res) => {
    try {
        const {to , from} = req.query
        if(!to || !from)
            return res.status(400).send('Dates required')

        const dateFrom = new Date(from);
        const dateTo = new Date(to);

        if(isNaN(dateFrom) || isNaN(dateTo))
            return res.status(400).send('Invalid date format. Use "YYYY-MM-DD" format')

        const attendance = await Attendance.find({
            date: {$gte: dateFrom , $lte: dateTo}
        })

        if (attendance.length === 0) {
            return res.status(404).send({
                message: 'No attendance record exists',
            });
        }
        
        res.send(attendance)
    } 
    catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error')
    }
        
})

//Setting grades, maxAttendance and minAttendance
router.post('/settingGradeingCriteria' , auth ,isAdmin ,  async(req, res) => {
    try {
        const {grade, minAttendance, maxAttendance}  = req.body;
        console.log(grade, minAttendance, maxAttendance)
        if(!grade || minAttendance === undefined || maxAttendance === undefined)
        return res.status(400).send('Following fields required: grade, minAttendance, maxAttendance')
    
        const grading = new Grading({
            grade,
            minAttendance,
            maxAttendance
        })
        
        await grading.save()
        res.send({"message": "Grading criteria set successfully", "data": grading})
    } 
    catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error')
    } 
})

//Grading Criteria record
router.get('/gradingCriteria' , auth , isAdmin , async(req,res) => {
    try {
     const criteria = await Grading.find()
     res.send(criteria)
    } 
    catch (error) {
     console.error(error.message)
     res.status(500).send('Internal server error')
    }
})
    
//Grades assignment based on criteria defined in Grading
router.get('/assignGrades/:id' , auth , isAdmin , async(req,res) => {
    try {
     const {id} = req.params;
     const attendance = await Attendance.find({user: id})
     if(!attendance.length) return res.status(404).send('Record not found')

    const presentCount = attendance.filter(record => record.statusofAttendance === 'present').length
    
    const criteria = await Grading.findOne({
        minAttendance: {$gte: presentCount},
        maxAttendance: {$lte: presentCount}
    })

    const grade = criteria ? criteria.grade : 'F'

    res.send({userId: id , presentCount , grade})
    } 
    catch (error) {
     console.error(error.message)
     res.status(500).send('Internal server error')
    }
 })
 


module.exports = router
