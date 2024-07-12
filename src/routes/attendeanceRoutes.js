const express = require('express');
const router = express.Router();
const attendanceController = require('../controller/attendenceController');
const { authenticate, authorize } = require('../middleware/authenticate');

router.post('/checkin', authenticate,attendanceController.checkIn);
router.post('/checkout',authenticate, attendanceController.checkOut);
router.get('/attendanceRecords/all',authenticate ,attendanceController.getAllEmployees);
router.get('/attendanceRecords/:employeeId',authenticate,authorize('HR'),attendanceController.getAllAttendanceRecords);
router.get('/attendanceRecords/', authenticate,authorize('HR'),attendanceController.getAttendanceByDate);
router.get('/attendanceRecords/all',authenticate, attendanceController.getAllEmployees);

// router.get('/calculate-salary', attendanceController.calculateSalary);

module.exports = router;
