const express = require('express');
const router = express.Router();
const Task = require('../models/task');

// Get all tasks with assignedTo populated
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignfrom').populate('assignedTo');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new task
router.post('/', async (req, res) => {
    const { assignfrom, title, description, assignedTo, deadline } = req.body;

    try {
        const newTask = new Task({
            assignfrom,
            title,
            description,
            assignedTo,
            deadline
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
