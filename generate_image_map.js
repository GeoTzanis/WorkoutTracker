// Run this in your project folder: node generate_image_map.js
// It scans your assets/exercises folder and creates exerciseImages.js

const fs = require('fs');
const path = require('path');

const baseDir = './assets/exercises';
const lines = [];
lines.push('// AUTO-GENERATED - DO NOT EDIT');
lines.push('const EXERCISE_IMAGES = {');

const muscles = fs.readdirSync(baseDir).filter(f => 
  fs.statSync(path.join(baseDir, f)).isDirectory()
);

let count = 0;
for (const muscle of muscles.sort()) {
  const files = fs.readdirSync(path.join(baseDir, muscle));
  for (const file of files.sort()) {
    if (file.match(/\.(webp|png|jpg|jpeg)$/i)) {
      const key = `${muscle}/${file.replace(/\.[^.]+$/, '')}`;
      const filePath = `./assets/exercises/${muscle}/${file}`;
      lines.push(`  '${key}': require('${filePath}'),`);
      count++;
    }
  }
}

lines.push('};');
lines.push('export default EXERCISE_IMAGES;');

fs.writeFileSync('exerciseImages.js', lines.join('\n'));
console.log(`Generated ${count} image entries in exerciseImages.js`);
