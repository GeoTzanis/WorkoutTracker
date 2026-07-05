// Run: node fix_bodyweight.js
const fs = require('fs');
const exercises = JSON.parse(fs.readFileSync('exercises_seed.json', 'utf8'));

const BODYWEIGHT_LIST = [
  'Dip Hold Isometric',
  'Parallel Bars Dips',
  'Ring Dips',
  'Suspended Dips',
  'Weighted Bench Dips',
  'Weighted Dips',
  'Chin Ups',
  'Hyperextension',
  'Inverted Row',
  'Pull Up',
  'Suspended Row',
  'Weighted Chin Ups',
  'Weighted Hammer Grip Pull Ups',
  'Weighted Pull Ups',
  'Rounded Back Extension',
  'Glute Ham Raise',
  'Handstand Push Up',
  'Triceps Dip',
  'Bench Dip',
  'Assisted Pull Up',
  'Band Assisted Pull Up',
  'Band Assisted Reverse Pull Up',
  'Nordic Hamstring Curl',
  'Assisted Nordic Hamstring Curl',
];

let changed = 0;
const updated = exercises.map(e => {
  const shouldBeBW = BODYWEIGHT_LIST.some(bw =>
    e.name.toLowerCase() === bw.toLowerCase()
  );
  const wasBW = e.isBodyweight;
  return { ...e, isBodyweight: shouldBeBW };
});

// Count changes
exercises.forEach((e, i) => {
  if (e.isBodyweight !== updated[i].isBodyweight) {
    console.log(`${e.isBodyweight ? 'REMOVED' : 'ADDED'} BW: ${e.name}`);
    changed++;
  }
});

fs.writeFileSync('exercises_seed.json', JSON.stringify(updated, null, 2));
console.log(`\nDone. ${changed} exercises updated.`);
console.log('BW exercises now:', updated.filter(e=>e.isBodyweight).map(e=>e.name).join(', '));
