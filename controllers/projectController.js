// controllers/projectController.js
const Project = require('../models/Project');

exports.getProjects = async (req, res, next) => {
  try {
    const { category, search, sort, page = 1, limit = 9, admin } = req.query;

    // Admin can see drafts, public can only see published
    const query = admin === 'true' ? {} : { published: true };

    if (category && category !== 'All') query.category = category;
    if (search) query.$text = { $search: search };

    let sortOptions = { displayOrder: 1, createdAt: -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'featured') sortOptions = { featured: -1, displayOrder: 1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const projects = await Project.find(query).sort(sortOptions).skip(skip).limit(limitNum);
    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
      data: projects,
    });
  } catch (error) { next(error); }
};

exports.getFeaturedProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ published: true, featured: true })
      .sort({ displayOrder: 1, createdAt: -1 }).limit(3);
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) { next(error); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Project.distinct('category', { published: true });
    res.status(200).json({ success: true, data: categories });
  } catch (error) { next(error); }
};

exports.getProjectBySlug = async (req, res, next) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    // Increment views if it's not a preview AND the project is published
    if (req.query.preview !== 'true' && project.published) {
      project.views += 1;
      await project.save();
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) { next(error); }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) { next(error); }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, data: project });
  } catch (error) { next(error); }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) { next(error); }
};