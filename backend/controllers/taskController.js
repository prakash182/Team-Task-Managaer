const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: check if user is member of a project
const getMemberRole = (project, userId) => {
  const member = project.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// @GET /api/projects/:projectId/tasks — get all tasks for a project
const getTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const role = getMemberRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied.' });

    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @POST /api/projects/:projectId/tasks — create a task
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const role = getMemberRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied.' });

    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    // Validate assignedTo is a project member
    if (assignedTo) {
      const isMember = project.members.some(m => m.user.toString() === assignedTo);
      if (!isMember) return res.status(400).json({ message: 'Assigned user is not a project member.' });
    }

    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate: dueDate || null,
      status: status || 'todo'
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({ message: 'Task created.', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @PUT /api/tasks/:id — update a task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const project = await Project.findById(task.project);
    const role = getMemberRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied.' });

    const { title, description, assignedTo, priority, dueDate, status } = req.body;

    // Members can only update status of their own tasks; admins can update anything
    if (role === 'member') {
      const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
      const isCreator = task.createdBy.toString() === req.user._id.toString();
      if (!isAssigned && !isCreator) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you or created by you.' });
      }
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (status) task.status = status;

    if (assignedTo !== undefined) {
      if (assignedTo) {
        const isMember = project.members.some(m => m.user.toString() === assignedTo);
        if (!isMember) return res.status(400).json({ message: 'Assigned user is not a project member.' });
      }
      task.assignedTo = assignedTo || null;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.json({ message: 'Task updated.', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @DELETE /api/tasks/:id — delete a task (admin or creator)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    const project = await Project.findById(task.project);
    const role = getMemberRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied.' });

    if (role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admins or task creators can delete tasks.' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// @GET /api/dashboard — get dashboard stats for current user
const getDashboard = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id });
    const projectIds = projects.map(p => p._id);

    const allTasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name color')
      .populate('assignedTo', 'name email');

    const myTasks = allTasks.filter(t => t.assignedTo && t.assignedTo._id.toString() === req.user._id.toString());
    const now = new Date();

    const stats = {
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      myTasks: myTasks.length,
      byStatus: {
        todo: allTasks.filter(t => t.status === 'todo').length,
        'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
        review: allTasks.filter(t => t.status === 'review').length,
        done: allTasks.filter(t => t.status === 'done').length
      },
      overdue: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length,
      recentTasks: allTasks.slice(0, 5)
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getDashboard };