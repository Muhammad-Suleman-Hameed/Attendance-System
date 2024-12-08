const mongoose = require('mongoose')

const gradingSchema = new mongoose.Schema({
    grade: {type:String, default: Date.now , required: true},
    minAttendance: {type: Number,  required: true},
    maxAttendance: {type: Number, required: true} 
} , 
{timestamps: true})

const Grading = mongoose.model('Grading' , gradingSchema)

exports.Grading = Grading;