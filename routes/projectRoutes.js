// routes/projectRoutes.js
const express = require('express');
const {
  getProjects,
  getFeaturedProjects,
  getCategories,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/featured', getFeaturedProjects);
router.get('/categories', getCategories);
router.get('/:slug', getProjectBySlug);

// Protected Admin routes
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;