const Task = require('../models/task');
const User = require('../models/user'); // Assuming the User model is needed for HR role verification

// Get all tasks with assignedTo and assignfrom populated
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignfrom').populate('assignedTo');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all tasks assigned to a specific employee
exports.getTasksForEmployee = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id }).populate('assignfrom');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    const { title, description, assignedTo, deadline } = req.body;

    try {
        // Ensure the request user is an HR
        if (req.user.role !== 'HR') {
            return res.status(403).json({ message: 'Only HR can assign tasks' });
        }

        const newTask = new Task({
            assignfrom: req.user._id, // Set the assignfrom field to the ID of the logged-in HR user
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
};

// Update task status and add completion description
exports.updateTaskStatus = async (req, res) => {
    const { taskId, status, completionDescription } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        task.status = status;
        if (status === 'Completed') {
            task.completionDescription = completionDescription;
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};