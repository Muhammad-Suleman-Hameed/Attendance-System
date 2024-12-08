const mongoose = require('mongoose')

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {type:Date, default: Date.now , required: true},
    statusofAttendance: {type: String , enum: ['present' , 'leave' , 'absent'] , required: true},
    leaveStatus: {type: String, enum: ['pending' , 'approved' , 'rejected'], default:'pending'},
    grade: {type: String, enum:['A','B','C','D','E', 'F'] , default: 'F'}
})
attendanceSchema.index({user: 1, date: 1} , {unique: true})

const Attendance = mongoose.model('Attendance' , attendanceSchema)

exports.Attendance = Attendance;