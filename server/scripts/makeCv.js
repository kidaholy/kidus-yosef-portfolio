/* Generates client/public/kidus-yosef-cv.pdf — a clean, valid single-page PDF.
 * Content sourced from Kidus Yosef-CV.docx.
 * Run: node scripts/makeCv.js  (inside /server)
 */
const fs = require('fs');
const path = require('path');

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const lines = [
  ['KIDUS YOSEF', 22, 'F'],
  ['Intermediate Full-Stack Developer  |  Addis Ababa, Ethiopia', 11, 'R'],
  ['kidayos2014@gmail.com', 11, 'R'],
  [' ', 11, 'R'],
  ['SUMMARY', 13, 'F'],
  ['Intermediate Full-Stack Developer with 4+ years of professional experience building', 11, 'R'],
  ['scalable, secure, and high-performance web applications. Strong expertise in React,', 11, 'R'],
  ['Next.js, Node.js, JavaScript, and MongoDB, with a primary focus on modern frontend', 11, 'R'],
  ['development and backend API engineering. Experienced in RESTful services, database', 11, 'R'],
  ['schema design, AI API integrations, cloud-based deployments, and performance-', 11, 'R'],
  ['optimized user interfaces, alongside deep WordPress experience.', 11, 'R'],
  [' ', 11, 'R'],
  ['EXPERIENCE', 13, 'F'],
  ['Software Engineer - Kossomed Cloud (09/2025 - 09/2026)', 11, 'F'],
  ['  - Full-stack web applications using React and Node.js.', 11, 'R'],
  ['  - Reusable frontend components and optimized client-side performance.', 11, 'R'],
  ['  - Backend services and APIs using Node.js/Express.js backed by MongoDB.', 11, 'R'],
  ['  - Relational database schemas and optimized queries for data-heavy features.', 11, 'R'],
  ['  - Third-party integrations incl. payment gateways and external APIs.', 11, 'R'],
  [' ', 11, 'R'],
  ['SELECTED PROJECTS', 13, 'F'],
  ['Kossomed Cloud - SaaS system for pharmacies, scalable.', 11, 'R'],
  ['Abe Hotel - Business website build and deployment incl. hosting setup (Dilla).', 11, 'R'],
  ['Tade Pharmacy - Dedicated pharmacy system owned instead of renting a SaaS.', 11, 'R'],
  [' ', 11, 'R'],
  ['TECHNICAL SKILLS', 13, 'F'],
  ['Frontend: React, Next.js, JavaScript (ES6+), HTML5, CSS3, state management.', 11, 'R'],
  ['Backend: Node.js, Express.js, Python, PHP, REST API design, secure coding.', 11, 'R'],
  ['Databases: MongoDB (schema design, indexing, query optimization), SQLite.', 11, 'R'],
  ['CMS & Ecommerce: WordPress, custom plugins, SEO (Rank Math, schema, CWV).', 11, 'R'],
  ['Tools: Git, GitHub, VS Code, Cursor / AI pair-programming workflows.', 11, 'R'],
  [' ', 11, 'R'],
  ['EDUCATION', 13, 'F'],
  ['B.Sc. Information System - Wolkite University, 2026', 11, 'R'],
  [' ', 11, 'R'],
  ['LANGUAGES', 13, 'F'],
  ['Amharic (Native)  |  English (Intermediate)', 11, 'R'],
  [' ', 11, 'R'],
  ['KEY ACHIEVEMENTS', 13, 'F'],
  ['- Improved performance, DB query efficiency and API response times by 30-40%.', 11, 'R'],
  ['- Delivered 5+ full-stack projects across tourism, healthcare and non-profit.', 11, 'R'],
  ['- Developed a custom AI-powered SEO plugin integrating AI APIs with WordPress.', 11, 'R'],
];

let y = 780;
const content = ['BT'];
for (const [text, size, font] of lines) {
  content.push(`/F1 ${size} Tf`);
  content.push(`1 0 0 1 60 ${y} Tm`);
  content.push(`(${esc(text)}) Tj`);
  y -= size >= 13 ? 22 : 17;
}
content.push('ET');
const stream = content.join('\n');

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
];

let pdf = '%PDF-1.4\n';
const offsets = [];
objects.forEach((body, i) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefStart = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
offsets.forEach((off) => {
  pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
});
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

const out = path.join(__dirname, '../../client/public/kidus-yosef-cv.pdf');
fs.writeFileSync(out, pdf, 'binary');
console.log(`CV written: ${out} (${Buffer.byteLength(pdf)} bytes)`);
