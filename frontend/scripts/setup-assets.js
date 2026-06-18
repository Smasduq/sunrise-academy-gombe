const fs = require('fs');
const path = require('path');

// 1. Files to update (.jpg -> .svg)
const FILES_TO_UPDATE = [
  'src/app/news/news.module.css',
  'src/app/gallery/gallery.module.css',
  'src/components/ProgramsSection/ProgramsSection.tsx',
  'src/app/admissions/admissions.module.css',
  'src/app/academics/academics.module.css',
  'src/app/academics/page.tsx',
  'src/lib/data.ts',
  'src/app/about/page.tsx',
  'src/app/about/about.module.css'
];

const workspaceRoot = path.resolve(__dirname, '..');

console.log('--- Phase 1: Replacing .jpg references with .svg ---');
FILES_TO_UPDATE.forEach((relPath) => {
  const fullPath = path.join(workspaceRoot, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    // Replace .jpg with .svg
    const updated = content.replace(/\.jpg/g, '.svg');
    if (content !== updated) {
      fs.writeFileSync(fullPath, updated, 'utf8');
      console.log(`Updated: ${relPath}`);
    } else {
      console.log(`No changes needed for: ${relPath}`);
    }
  } else {
    console.warn(`File not found: ${relPath}`);
  }
});

console.log('\n--- Phase 2: Generating SVG placeholder assets ---');
const IMAGES_DIR = path.join(workspaceRoot, 'public', 'images');

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  console.log(`Created directory: public/images`);
}

// Helper: General SVG image
function generateGeneralSvg(title, subtitle, icon, gradStart, gradEnd, width = 800, height = 600) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${title.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${gradStart};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${gradEnd};stop-opacity:1" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.15" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad-${title.replace(/\s+/g, '')})" />
    <g opacity="0.12">
      <circle cx="${width * 0.8}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.45}" fill="#ffffff" />
      <path d="M0,${height} Q${width * 0.25},${height * 0.6} ${width * 0.5},${height * 0.8} T${width},${height * 0.5} L${width},${height} Z" fill="#ffffff" />
      <path d="M0,${height} Q${width * 0.3},${height * 0.45} ${width * 0.65},${height * 0.75} T${width},${height * 0.35} L${width},${height} Z" fill="#ffffff" opacity="0.5" />
    </g>
    <g transform="translate(${width * 0.08}, ${height * 0.25})">
      <g filter="url(#shadow)">
        <rect width="70" height="70" rx="18" fill="#ffffff" />
        <text x="35" y="47" font-family="system-ui, -apple-system, sans-serif" font-size="32" text-anchor="middle" fill="#0f766e">${icon}</text>
      </g>
      <text x="0" y="130" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#ffffff">${title}</text>
      <text x="0" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="#f1f5f9" opacity="0.9">${subtitle}</text>
    </g>
  </svg>`;
}

// Helper: Staff Portrait SVG
function generateStaffSvg(name, role, dept, gradStart, gradEnd, width = 600, height = 800) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${name.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${gradStart};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${gradEnd};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad-${name.replace(/\s+/g, '')})" />
    <circle cx="${width / 2}" cy="${height * 0.35}" r="${width * 0.22}" fill="#ffffff" opacity="0.15" />
    <circle cx="${width / 2}" cy="${height * 0.35}" r="${width * 0.18}" fill="#ffffff" opacity="0.25" />
    <text x="${width / 2}" y="${height * 0.42}" font-size="110" text-anchor="middle" fill="#ffffff">👤</text>
    
    <rect x="0" y="${height * 0.62}" width="${width}" height="${height * 0.38}" fill="rgba(15, 23, 42, 0.88)" />
    <text x="${width / 2}" y="${height * 0.72}" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="#ffffff" text-anchor="middle">${name}</text>
    <text x="${width / 2}" y="${height * 0.80}" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#14b8a6" text-anchor="middle">${role}</text>
    <text x="${width / 2}" y="${height * 0.87}" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">${dept}</text>
  </svg>`;
}

// Helper: Testimonial/Avatar SVG
function generateTestimonialSvg(name, role, gradStart, gradEnd, width = 400, height = 400) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
    <defs>
      <linearGradient id="grad-${name.replace(/\s+/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${gradStart};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${gradEnd};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad-${name.replace(/\s+/g, '')})" />
    <circle cx="${width / 2}" cy="${height * 0.4}" r="${width * 0.25}" fill="#ffffff" opacity="0.2" />
    <text x="${width / 2}" y="${height * 0.48}" font-size="70" text-anchor="middle">👤</text>
    <text x="${width / 2}" y="${height * 0.8}" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">${name}</text>
    <text x="${width / 2}" y="${height * 0.88}" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">${role}</text>
  </svg>`;
}

// Asset specifications
const ASSETS = [
  // Heros
  { file: 'hero-1.svg', type: 'general', title: 'Nurturing Minds', sub: 'Shaping Futures Since 2009', icon: '🌅', gStart: '#0f766e', gEnd: '#0d5c55', w: 1920, h: 1080 },
  { file: 'hero-2.svg', type: 'general', title: 'Excellence in Classrooms', sub: 'Qualified Teachers & Holistic Growth', icon: '📚', gStart: '#111827', gEnd: '#1f2937', w: 1920, h: 1080 },
  { file: 'hero-3.svg', type: 'general', title: 'Where Learning Meets Joy', sub: 'Modern Infrastructure & Inspiring Play', icon: '🎨', gStart: '#d97706', gEnd: '#b45309', w: 1920, h: 1080 },

  // Programs
  { file: 'program-nursery.svg', type: 'general', title: 'Nursery School', sub: 'Ages 2 – 5 Years', icon: '🌱', gStart: '#14b8a6', gEnd: '#0f766e' },
  { file: 'program-primary.svg', type: 'general', title: 'Primary School', sub: 'Ages 6 – 11 Years', icon: '🏫', gStart: '#0f766e', gEnd: '#115e59' },
  { file: 'program-secondary.svg', type: 'general', title: 'Secondary School', sub: 'Ages 12 – 17 Years', icon: '🎯', gStart: '#1e293b', gEnd: '#0f172a' },
  { file: 'about-school.svg', type: 'general', title: 'Sunrise Academy Campus', sub: 'Akko LGA, Gombe State', icon: '🏫', gStart: '#0f766e', gEnd: '#1e293b' },

  // News
  { file: 'news-1.svg', type: 'general', title: 'State Science Fair', sub: 'First Place Achievements', icon: '🏆', gStart: '#0369a1', gEnd: '#0c4a6e' },
  { file: 'news-2.svg', type: 'general', title: 'Modern Computer Lab', sub: '50 High-Speed Workstations', icon: '💻', gStart: '#0f766e', gEnd: '#134e4a' },
  { file: 'news-3.svg', type: 'general', title: 'Inter-House Sports', sub: 'Celebrating Athletics & teamwork', icon: '🏃‍♂️', gStart: '#b45309', gEnd: '#78350f' },
  { file: 'news-4.svg', type: 'general', title: 'Parent-Teacher Forum', sub: 'Discussing Academic Progress', icon: '🤝', gStart: '#4b5563', gEnd: '#1f2937' },

  // Gallery
  { file: 'gallery-classroom-1.svg', type: 'general', title: 'Primary Classroom', sub: 'Bright, Ventilated Learning Spaces', icon: '🎒', gStart: '#0f766e', gEnd: '#115e59' },
  { file: 'gallery-classroom-2.svg', type: 'general', title: 'ICT Practical', sub: 'Hands-on Digital Training', icon: '⌨️', gStart: '#0369a1', gEnd: '#0f172a' },
  { file: 'gallery-classroom-3.svg', type: 'general', title: 'Library Session', sub: 'Nurturing a Love for Reading', icon: '📖', gStart: '#475569', gEnd: '#334155' },
  { file: 'gallery-event-1.svg', type: 'general', title: 'Graduation Ceremony', sub: 'Honouring SS3 & JSS3 Graduates', icon: '🎓', gStart: '#8d99ae', gEnd: '#2b2d42' },
  { file: 'gallery-event-2.svg', type: 'general', title: 'Relay Race Finals', sub: 'Fostering Team Spirit & Speed', icon: '👟', gStart: '#ea580c', gEnd: '#9a3412' },
  { file: 'gallery-event-3.svg', type: 'general', title: 'Cultural Day', sub: 'Celebrating Diversity & Heritage', icon: '🥁', gStart: '#be123c', gEnd: '#4c0519' },
  { file: 'gallery-activity-1.svg', type: 'general', title: 'Science Lab Experiment', sub: 'Exploring Chemistry & Physics', icon: '🔬', gStart: '#0d9488', gEnd: '#115e59' },
  { file: 'gallery-activity-2.svg', type: 'general', title: 'Arts & Craft Class', sub: 'Unlocking Creative Potential', icon: '🎨', gStart: '#db2777', gEnd: '#831843' },
  { file: 'gallery-activity-3.svg', type: 'general', title: 'Inter-School Debate', sub: 'Developing Communication Skills', icon: '📢', gStart: '#4f46e5', gEnd: '#312e81' },
  { file: 'gallery-campus-1.svg', type: 'general', title: 'Main Administration Block', sub: 'Modern Multi-storey Infrastructure', icon: '🏢', gStart: '#0f766e', gEnd: '#0f172a' },
  { file: 'gallery-campus-2.svg', type: 'general', title: 'Recreational Arena', sub: 'Spacious & Safe Playground', icon: '⚽', gStart: '#16a34a', gEnd: '#14532d' },
  { file: 'gallery-campus-3.svg', type: 'general', title: 'Green Botanical Garden', sub: 'Environmental Learning Center', icon: '🌻', gStart: '#65a30d', gEnd: '#365314' },

  // Staff
  { file: 'staff-principal.svg', type: 'staff', name: 'Ibrahim Isa', role: 'School Principal', dept: 'Administration', gStart: '#134e4a', gEnd: '#0f172a' },
  { file: 'staff-2.svg', type: 'staff', name: 'Mr. Ibrahim Aliyu', role: 'Vice Principal (Academics)', dept: 'Administration', gStart: '#0f172a', gEnd: '#1e293b' },
  { file: 'staff-3.svg', type: 'staff', name: 'Mrs. Fatima Usman', role: 'Head of Primary School', dept: 'Primary', gStart: '#312e81', gEnd: '#1e1b4b' },
  { file: 'staff-4.svg', type: 'staff', name: 'Mr. Yakubu Adamu', role: 'Mathematics Teacher', dept: 'Secondary', gStart: '#1f2937', gEnd: '#111827' },
  { file: 'staff-5.svg', type: 'staff', name: 'Mrs. Grace Tanko', role: 'English Teacher', dept: 'Secondary', gStart: '#581c87', gEnd: '#3b0764' },
  { file: 'staff-6.svg', type: 'staff', name: 'Mr. Hassan Bello', role: 'Science Teacher', dept: 'Secondary', gStart: '#064e3b', gEnd: '#022c22' },
  { file: 'staff-7.svg', type: 'staff', name: 'Miss Zainab Suleiman', role: 'Nursery Class Teacher', dept: 'Nursery', gStart: '#831843', gEnd: '#500724' },
  { file: 'staff-8.svg', type: 'staff', name: 'Mr. Emmanuel Danjuma', role: 'ICT Teacher', dept: 'Secondary', gStart: '#172554', gEnd: '#0c0a09' },

  // Testimonials
  { file: 'testimonial-1.svg', type: 'testimonial', name: 'Alhaji Musa Adamu', role: 'Parent of JSS3 Student', gStart: '#0f172a', gEnd: '#334155' },
  { file: 'testimonial-2.svg', type: 'testimonial', name: 'Mrs. Rebecca James', role: 'Parent of Primary 5 Student', gStart: '#0369a1', gEnd: '#0c4a6e' },
  { file: 'testimonial-3.svg', type: 'testimonial', name: 'Mr. Abdullahi Garba', role: 'Parent of Nursery Student', gStart: '#0d9488', gEnd: '#134e4a' }
];

ASSETS.forEach((asset) => {
  const filePath = path.join(IMAGES_DIR, asset.file);
  let svgContent = '';
  
  if (asset.type === 'general') {
    svgContent = generateGeneralSvg(asset.title, asset.sub, asset.icon, asset.gStart, asset.gEnd, asset.w, asset.h);
  } else if (asset.type === 'staff') {
    svgContent = generateStaffSvg(asset.name, asset.role, asset.dept, asset.gStart, asset.gEnd);
  } else if (asset.type === 'testimonial') {
    svgContent = generateTestimonialSvg(asset.name, asset.role, asset.gStart, asset.gEnd);
  }
  
  fs.writeFileSync(filePath, svgContent, 'utf8');
  console.log(`Generated: ${asset.file}`);
});

console.log('\nAsset setup completed successfully!');
