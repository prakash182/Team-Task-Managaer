const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, createProject, getProject,
  updateProject, deleteProject, addMember, removeMember
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All project routes require auth

router.get('/', getProjects);

router.post('/', [
  body('name').trim().isLength({ min: 2 }).withMessage('Project name must be at least 2 characters')
], createProject);

router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;