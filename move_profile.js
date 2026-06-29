const fs = require('fs');
const path = require('path');

const authorsSlugDir = path.join(__dirname, 'src', 'app', '(public)', 'authors', '[slug]');
const profileSlugDir = path.join(__dirname, 'src', 'app', '(public)', 'profile', '[slug]');
const authorsDir = path.join(__dirname, 'src', 'app', '(public)', 'authors');

// 1. Move authors/[slug] to profile/[slug]
if (fs.existsSync(authorsSlugDir)) {
  fs.mkdirSync(profileSlugDir, { recursive: true });
  fs.renameSync(path.join(authorsSlugDir, 'page.tsx'), path.join(profileSlugDir, 'page.tsx'));
  console.log('Moved page.tsx');
} else {
  console.log('authors/[slug] not found, assuming already moved.');
}

// 2. Remove old authors directory
if (fs.existsSync(authorsDir)) {
  fs.rmSync(authorsDir, { recursive: true, force: true });
  console.log('Removed authors directory');
}
