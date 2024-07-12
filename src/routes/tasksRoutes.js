const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');
const { authenticate, authorize } = require('../middleware/authenticate');

// Get all tasks
router.get('/',  authenticate, authorize('HR'), taskController.getAllTasks);

// Get tasks for the logged-in employee
router.get('/mytasks', authenticate, authorize('Employee'), taskController.getTasksForEmployee);

// Create a new task
router.post('/', authenticate, authorize('HR'), taskController.createTask);

// Update task status
router.put('/update-status', authenticate,  authorize('Employee'), taskController.updateTaskStatus);

module.exports = router;