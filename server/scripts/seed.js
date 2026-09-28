/* Seed the MongoDB database with Kidus Yosef's portfolio content.
 * Usage: npm run seed  (inside /server)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Project = require('../src/models/Project');
const Experience = require('../src/models/Experience');
const SkillGroup = require('../src/models/SkillGroup');
const Post = require('../src/models/Post');
const profile = require('../src/data/profile');

const seed = async () => {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.error('❌ Cannot seed — database is not reachable. Check MONGODB_URI in server/.env');
    process.exit(1);
  }

  try {
    await Promise.all([
      Project.deleteMany({}),
      Experience.deleteMany({}),
      SkillGroup.deleteMany({}),
      Post.deleteMany({}),
    ]);

    await Promise.all([
      Project.insertMany(profile.projects),
      Experience.insertMany(profile.experience),
      SkillGroup.insertMany(profile.skillGroups),
      Post.insertMany(profile.posts),
    ]);

    console.log(
      `✅ Seeded: ${profile.projects.length} projects, ${profile.experience.length} experience entries, ` +
        `${profile.skillGroups.length} skill groups, ${profile.posts.length} posts`
    );
    console.log('👋 Done. Start the server with `npm run dev`.');
  } catch (err) {
    console.error(`❌ Seed failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close().catch(() => {});
  }
};

seed();
