const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');

// @GET /api/projects — get all projects for current user
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @POST /api/projects — create a project
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, description, color } = req.body;

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      owner: req.user._id
    });

    await project.populate('owner', 'name email');
    await project.populate('members.user', 'name email');

    res.status(201).json({ message: 'Project created.', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @GET /api/projects/:id — get single project
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied.' });

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @PUT /api/projects/:id — update project (admin only)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update the project.' });
    }

    const { name, description, status, color } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;
    if (color) project.color = color;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members.user', 'name email');

    res.json({ message: 'Project updated.', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @DELETE /api/projects/:id — delete project (owner only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can delete it.' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and all its tasks deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @POST /api/projects/:id/members — add member (admin only)
const addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const adminMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminMember || adminMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add members.' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found with that email.' });

    const alreadyMember = project.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User is already a member.' });

    project.members.push({ user: userToAdd._id, role: role || 'member' });
    await project.save();
    await project.populate('members.user', 'name email');

    res.json({ message: 'Member added.', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @DELETE /api/projects/:id/members/:userId — remove member (admin only)
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const adminMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminMember || adminMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can remove members.' });
    }

    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project owner.' });
    }

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    await project.populate('members.user', 'name email');

    res.json({ message: 'Member removed.', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember };