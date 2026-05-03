const express = require('express');
const router = express.Router();
const { getTasksByProject, getMyTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, authorizeRole('Admin'), createTask);

router.route('/me')
  .get(protect, getMyTasks);

router.route('/project/:projectId')
  .get(protect, getTasksByProject);

router.route('/:id')
  .put(protect, updateTask) // Status updates allowed by assignee
  .delete(protect, authorizeRole('Admin'), deleteTask);

module.exports = router;
