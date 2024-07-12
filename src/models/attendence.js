const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employelistdata',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    checkIn: {
        type: Date,
    },
    checkOut: {
        type: Date,
    },
    totalHours: {
        type: Number, // Total working hours in decimal format (e.g., 8.5 for 8 hours 30 minutes)
    },
    workingDays:{
        type:Number,
    },

    totalleave:{

        type:Number,
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'On Leave'],
        default: 'Present'
    }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
