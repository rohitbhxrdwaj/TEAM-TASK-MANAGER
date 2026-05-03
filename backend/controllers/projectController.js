const Project = require('../models/Project');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      // Admins see projects they created or are members of
      projects = await Project.find({
        $or: [{ createdBy: req.user._id }, { members: req.user._id }]
      }).populate('createdBy', 'name email').populate('members', 'name email');
    } else {
      // Members see projects they are added to
      projects = await Project.find({ members: req.user._id })
        .populate('createdBy', 'name email').populate('members', 'name email');
    }
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access to this project
    const isCreator = project.createdBy._id.toString() === req.user._id.toString();
    const isMember = project.members.some(member => member._id.toString() === req.user._id.toString());

    if (!isCreator && !isMember && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  const { title, description, members } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Include the creator in the members list if not already there
    const projectMembers = members || [];
    if (!projectMembers.includes(req.user._id.toString())) {
      projectMembers.push(req.user._id.toString());
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: projectMembers
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a project (add members, etc)
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the creator
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('members', 'name email');

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject
};
