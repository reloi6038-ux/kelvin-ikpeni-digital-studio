// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Project name is required'], trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 200 },
    longDescription: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      required: true, 
      enum: ['Websites', 'Web Applications', 'Coding Platforms', 'Educational Technology', 'Digital Products', 'Experiments & Open-Source'],
      index: true 
    },
    technologies: { type: [String], default: [] },
    thumbnailUrl: { type: String, default: '' },
    galleryImages: { type: [String], default: [] },
    liveUrl: { type: String, default: '' },
    repoUrl: { type: String, default: '' },
    status: { type: String, enum: ['completed', 'in-progress', 'planned'], default: 'planned', index: true },
    featured: { type: Boolean, default: false, index: true },
    completionDate: { type: Date, default: null },
    displayOrder: { type: Number, default: 0 },
    published: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0 }, // Analytics tracking
  },
  { timestamps: true }
);

projectSchema.index({ name: 'text', shortDescription: 'text', technologies: 'text' });

module.exports = mongoose.model('Project', projectSchema);