// scripts/seedProjects.js
// Run this script using: npm run seed
const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('../models/Project');
const connectDB = require('../config/database');

const projects = [
  {
    name: 'Kelvin Ikpeni University (KIU)',
    slug: 'kelvin-ikpeni-university',
    shortDescription: 'An educational website built using Node.js, Express.js, and MongoDB.',
    longDescription: 'Kelvin Ikpeni University (KIU) is a comprehensive educational platform designed to deliver course content, manage student enrollments, and facilitate online learning. Built from the ground up with Node.js, Express.js, and MongoDB, it features a scalable backend architecture to handle user authentication, dynamic content rendering, and database-driven course management.',
    category: 'Educational Technology',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'HTML5', 'CSS3', 'Vanilla JavaScript'],
    thumbnailUrl: '/images/projects/kiu-thumb.jpg',
    galleryImages: [],
    liveUrl: '',
    repoUrl: '',
    status: 'completed',
    featured: true,
    displayOrder: 1,
    published: true,
  },
  {
    name: 'The Kelvin Ikpeni Dev Bootcamp',
    slug: 'kelvin-ikpeni-dev-bootcamp',
    shortDescription: 'A full-stack web development learning platform for beginners.',
    longDescription: 'A full-stack web development learning platform designed for absolute beginners. It includes practical learning activities, step-by-step coding exercises, and downloadable course completion certificates. The platform guides students through the fundamentals of HTML, CSS, JavaScript, and backend development using Node.js and Express.js.',
    category: 'Coding Platforms',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB'],
    thumbnailUrl: '/images/projects/dev-bootcamp-thumb.jpg',
    galleryImages: [],
    liveUrl: '',
    repoUrl: '',
    status: 'in-progress',
    featured: true,
    displayOrder: 2,
    published: true,
  },
  {
    name: 'Hotel Website Project',
    slug: 'hotel-website-project',
    shortDescription: 'A modern hotel website project built using VS Code, Node.js, and Express.js.',
    longDescription: 'A fully responsive hotel website featuring room bookings, amenities showcases, and a customer contact system. Developed using VS Code, Node.js, and Express.js, this project focuses on responsive design, smooth user interactions, and server-side form handling.',
    category: 'Websites',
    technologies: ['Node.js', 'Express.js', 'HTML5', 'CSS3', 'JavaScript'],
    thumbnailUrl: '/images/projects/hotel-thumb.jpg',
    galleryImages: [],
    liveUrl: '',
    repoUrl: '',
    status: 'completed',
    featured: true,
    displayOrder: 3,
    published: true,
  },
  {
    name: 'Kelvin Ikpeni Marketplace',
    slug: 'kelvin-ikpeni-marketplace',
    shortDescription: 'A planned multi-vendor marketplace for Nigerian and international customers.',
    longDescription: 'A planned multi-vendor e-commerce platform designed to connect Nigerian vendors with both local and international customers. The platform will feature vendor profiles, product catalogs, shopping carts, secure checkout integration, and order tracking.',
    category: 'Web Applications',
    technologies: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    thumbnailUrl: '/images/projects/marketplace-thumb.jpg',
    galleryImages: [],
    liveUrl: '',
    repoUrl: '',
    status: 'planned',
    featured: false,
    displayOrder: 4,
    published: true,
  },
  {
    name: 'Kelvin Ikpeni Code Academy',
    slug: 'kelvin-ikpeni-code-academy',
    shortDescription: 'A coding education platform concept for interactive exercises and guided projects.',
    longDescription: 'An interactive coding education platform concept focused on providing hands-on learning experiences. The Code Academy aims to offer interactive coding exercises, guided mini-projects, and immediate feedback to help beginners master web development concepts.',
    category: 'Coding Platforms',
    technologies: ['JavaScript', 'HTML5', 'CSS3', 'Node.js'],
    thumbnailUrl: '/images/projects/code-academy-thumb.jpg',
    galleryImages: [],
    liveUrl: '',
    repoUrl: '',
    status: 'planned',
    featured: false,
    displayOrder: 5,
    published: true,
  },
  {
    name: 'Additional Websites & Digital Products',
    slug: 'additional-websites-digital-products',
    shortDescription: 'A flexible category for other completed, ongoing, experimental, and future projects.',
    longDescription: 'This space is reserved for various experiments, open-source contributions, and digital products currently in development. As new digital experiences are crafted, they will be added here and categorized accordingly.',
    category: 'Experiments & Open-Source',
    technologies: ['Various'],
    thumbnailUrl: '/images/projects/experiments-thumb.jpg',
    galleryImages: [],
    liveUrl: '',
    repoUrl: '',
    status: 'in-progress',
    featured: false,
    displayOrder: 6,
    published: true,
  }
];

async function seedDatabase() {
  try {
    await connectDB();
    console.log('\n⏳ Seeding projects...');

    for (const project of projects) {
      // Upsert: Update if exists (by slug), Insert if not
      await Project.findOneAndUpdate(
        { slug: project.slug }, 
        project, 
        { upsert: true, returnDocument: 'after', runValidators: true } // Changed 'new: true' to 'returnDocument: "after"'
      );
      console.log(`✅ Processed: ${project.name}`);
    }

    console.log('\n🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();