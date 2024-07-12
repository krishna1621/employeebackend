const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendence');

// Get all attendance records
router.get('/', async (req, res) => {
    try {
        const attendance = await Attendance.find().populate('employee');
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Check in
router.post('/checkin', async (req, res) => {
    const { employeeId } = req.body;
    try {
        let today = new Date().setHours(0, 0, 0, 0);
        let attendance = await Attendance.findOne({ employee: employeeId, date: today });

        if (!attendance) {
            attendance = new Attendance({
                employee: employeeId,
                date: today,
                checkIn: new Date()
            });
        } else {
            if (attendance.checkIn) {
                return res.status(400).json({ message: 'Already checked in for today' });
            }
            attendance.checkIn = new Date();
        }

        await attendance.save();
        res.status(201).json(attendance);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Check out
router.post('/checkout', async (req, res) => {
    const { employeeId } = req.body;
    try {
        let today = new Date().setHours(0, 0, 0, 0);
        let attendance = await Attendance.findOne({ employee: employeeId, date: today });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({ message: 'No check-in record found for today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out for today' });
        }

        attendance.checkOut = new Date();

        // Calculate total hours
        let checkIn = new Date(attendance.checkIn);
        let checkOut = new Date(attendance.checkOut);
        let totalHours = (checkOut - checkIn) / 1000 / 60 / 60; // Convert milliseconds to hours
        attendance.totalHours = totalHours.toFixed(2);

        await attendance.save();
        res.status(200).json(attendance);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
