const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const SkillGroup = require('../models/SkillGroup');
const Post = require('../models/Post');
const profile = require('../data/profile');

const router = express.Router();

// @route   GET /api/portfolio
// @desc    Full portfolio content (DB if seeded, otherwise bundled profile)
router.get('/', async (req, res) => {
  // Serve fallback immediately when the DB is unreachable (no waiting on timeouts)
  if (mongoose.connection.readyState !== 1) {
    return res.json({ ...profile, source: 'fallback' });
  }
  try {
    const [projects, experience, skills, posts] = await Promise.all([
      Project.find().sort({ order: 1 }).lean(),
      Experience.find().sort({ order: 1 }).lean(),
      SkillGroup.find().sort({ order: 1 }).lean(),
      Post.find().sort({ order: 1 }).lean(),
    ]);

    const hasData = projects.length > 0 || experience.length > 0 || skills.length > 0 || posts.length > 0;

    if (hasData) {
      return res.json({
        ...profile,
        projects: projects.length ? projects : profile.projects,
        experience: experience.length ? experience : profile.experience,
        skillGroups: skills.length ? skills : profile.skillGroups,
        posts: posts.length ? posts : profile.posts,
        source: 'database',
      });
    }
    res.json({ ...profile, source: 'fallback' });
  } catch (err) {
    console.error(`portfolio error: ${err.message}`);
    res.json({ ...profile, source: 'fallback' });
  }
});

// @route   GET /api/portfolio/health
// @desc    Basic API health check
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

module.exports = router;
