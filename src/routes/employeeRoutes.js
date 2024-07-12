const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');

// Get all employees
router.get('/', async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    const {    employeeId, name, email, position, department } = req.body;

    // Validate required fields
    if (!name || !email || !position || !department) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if email already exists
        const existingEmployee = await Employee.findOne({ email: email });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }

        // Create new employee
        const newEmployee = new Employee({
            employeeId,
            name,
            email,
            position,
            department
        });

        // Save employee to database
        const employee = await newEmployee.save();
        res.status(201).json(employee);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
