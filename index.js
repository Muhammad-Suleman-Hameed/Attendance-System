const users = require('./routes/users')
const auth = require('./routes/auth')
//const students = require('./routes/students')
const express = require('express');
const mongoose = require('mongoose');
const attendance = require('./routes/attendance')
const leave = require('./routes/leave')
const admin = require('./routes/admin')
require('dotenv').config();


const app = express();

app.use(express.json());
app.use('/users' , users)
app.use('/auth' , auth)
app.use('/markattendance' , attendance)
app.use('/leaverequest' , leave)
app.use('/admin' , admin)
//app.use('/students' , students)


app.listen(5151)
    console.log('Server Running On Port 5151...')

mongoose.connect('mongodb://localhost/AttendanceSystem')
    .then(() => { console.log('DataBase Server Connected Successfully...')})
    .catch(() => { console.log('DataBase Server Connection Unsuccessful...')})



