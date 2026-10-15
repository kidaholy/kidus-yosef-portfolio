const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const SkillGroup = require('../models/SkillGroup');
const Post = require('../models/Post');
const profile = require('../data/profile');

const router = express.Router();

// A slow database must never delay the page: the bundled profile is complete,
// so if the database doesn't answer within this window we serve it right away.
const DB_QUERY_TIMEOUT_MS = 1000;

const withDeadline = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      const timer = setTimeout(() => reject(new Error(`${label} exceeded ${ms}ms`)), ms);
      if (typeof timer.unref === 'function') timer.unref();
    }),
  ]);

// @route   GET /api/portfolio
// @desc    Full portfolio content (DB if seeded, otherwise bundled profile)
router.get('/', async (req, res) => {
  // Serve fallback immediately when the DB is unreachable (no waiting on timeouts)
  if (mongoose.connection.readyState !== 1) {
    return res.json({ ...profile, source: 'fallback' });
  }
  try {
    const [projects, experience, skills, posts] = await withDeadline(
      Promise.all([
        Project.find().sort({ order: 1 }).lean(),
        Experience.find().sort({ order: 1 }).lean(),
        SkillGroup.find().sort({ order: 1 }).lean(),
        Post.find().sort({ order: 1 }).lean(),
      ]),
      DB_QUERY_TIMEOUT_MS,
      'portfolio query'
    );

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
    // Failed or simply slower than the deadline — the bundled profile has the
    // same content, so respond with it now instead of making the visitor wait.
    console.warn(`portfolio: serving bundled content (${err.message})`);
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
