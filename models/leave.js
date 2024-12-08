const mongoose = require('mongoose')

const leaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {type:Date, default: Date.now },
    startDate: {type: Date ,  required: true},
    endDate: {type: Date ,  required: true},
    reason: {type: String , maxlength: 700, required: true},
    statusofLeave: {type: String , enum: ['pending' , 'accepted' , 'rejected'] , default: 'pending', required: true}
})

const Leave = mongoose.model('Leave' , leaveSchema)

exports.Leave = Leave;