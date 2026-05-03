const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized. Invalid token.' });
  }
};

// Check if user is admin of a project
const requireProjectAdmin = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const projectId = req.params.projectId || req.body.projectId;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const member = project.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can perform this action.' });
    }

    req.project = project;
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { protect, requireProjectAdmin };