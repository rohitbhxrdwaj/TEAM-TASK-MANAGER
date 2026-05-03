const express = require('express');
const router = express.Router();
const { getProjects, getProjectById, createProject, updateProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorizeRole('Admin'), createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, authorizeRole('Admin'), updateProject);

module.exports = router;
