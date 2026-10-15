# Kidus Yosef — Portfolio

Personal portfolio website for **Kidus Yosef**, Full-Stack Developer — built with the MERN stack and deployed on Vercel.

🔗 **Live:** https://kidus-yosef.vercel.app

## Features

- Single-page portfolio: Hero, About, Services, Experience timeline, Skills toolkit, Stats, Portfolio with category filters, auto-shuffling Testimonials slider, and Contact form
- Contact messages stored in MongoDB with an admin inbox (`/messages`, Basic Auth)
- REST API serving all site content (graceful fallback when the database is unreachable)
- Scroll-reveal animations, responsive white/orange design, downloadable CV

## Tech Stack

| Layer    | Tech                                            |
| -------- | ----------------------------------------------- |
| Frontend | React 18, React Router 6, CRA, custom CSS       |
| Backend  | Node.js, Express, Mongoose                      |
| Database | MongoDB Atlas                                   |
| Deploy   | Vercel (static client + serverless API)         |

## Project Structure

```
kidus-yosef-portfolio/
├── api/index.js        # Vercel serverless entry (reuses the Express app)
├── client/             # React frontend (CRA)
├── server/             # Express API, models, routes, content data
│   ├── src/data/profile.js   # All site content — edit here to update the site
│   └── scripts/        # CV generator + DB seeder
└── vercel.json         # Deployment config
```

## Running Locally

```bash
npm run install:all   # installs root, server and client dependencies
npm run dev           # starts API on :5000 and client on :3000
```

Open http://localhost:3000.

## Environment Variables

`server/.env`:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=<your Atlas connection string>
CLIENT_ORIGIN=http://localhost:3000
ADMIN_USER=admin
ADMIN_PASSWORD=<your admin password>
```

On Vercel these are set as project environment variables (`MONGODB_URI`, `ADMIN_USER`, `ADMIN_PASSWORD`).

## Deployment

Pushes to `main` can be deployed with `vercel --prod`. The `/api/*` routes are handled by a serverless function that connects to MongoDB Atlas on cold start — make sure your Atlas network access allows connections from anywhere (`0.0.0.0/0`).

## Admin Inbox

Visit `/messages` and sign in with the admin credentials to read, mark, and delete contact-form submissions.

---

© 2026 Kidus Yosef · Addis Ababa, Ethiopia
