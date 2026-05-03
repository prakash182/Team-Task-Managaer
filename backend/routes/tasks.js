const express = require('express');
const { body } = require('express-validator');
const { getTasks, createTask, updateTask, deleteTask, getDashboard } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Dashboard
router.get('/dashboard', getDashboard);

// Project tasks
router.get('/project/:projectId', getTasks);

router.post('/project/:projectId', [
  body('title').trim().isLength({ min: 2 }).withMessage('Task title must be at least 2 characters')
], createTask);

// Single task operations
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;