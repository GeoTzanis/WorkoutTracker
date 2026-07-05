// Run this: node seed_from_images.js
// Reads exerciseImages.js to get all exercises, generates exercises_seed.json

const fs = require('fs');

// Read exerciseImages.js and extract all keys
const content = fs.readFileSync('exerciseImages.js', 'utf8');
const keyRegex = /'([^']+)':\s*require\(/g;
const entries = [];
let match;
while ((match = keyRegex.exec(content)) !== null) {
  entries.push(match[1]); // e.g. "Chest/Barbell_Bench_Press"
}

function detectEquipment(name) {
  const n = name.toLowerCase();
  if (n.includes('single arm dumbbell') || n.includes('single arm dumbell')) return 'Single Dumbbell';
  if (n.includes('barbell') || n.includes('ez bar') || n.includes('landmine') || n.includes('trap bar') || n.includes('belt squat') || n.includes('safety bar')) return 'Barbell';
  if (n.includes('dumbbell') || n.includes('dumbell') || n.includes('kettlebell')) return 'Dumbbell';
  if (n.includes('cable') || n.includes('rope attachment')) return 'Cable';
  if (n.includes('lever') || n.includes('machine') || n.includes('sled') || n.includes('smith') || n.includes('plate loaded') || n.includes('assisted') || n.includes('rotary') || n.includes('gripper') || n.includes('wrist roller')) return 'Machine';
  if (n.includes('pushup') || n.includes('push up') || n.includes('push-up') || n.includes('pull up') || n.includes('chin up') || n.includes('dip') || n.includes('plank') || n.includes('handstand') || n.includes('nordic') || n.includes('suspension') || n.includes('ring') || n.includes('inverted row') || n.includes('bodyweight') || n.includes('dragon flag') || n.includes('sit up') || n.includes('crunch') || n.includes('leg raise') || n.includes('glute ham') || n.includes('hyperext') || n.includes('lunge') || n.includes('squat') || n.includes('step up')) return 'Bodyweight';
  return 'Other';
}

const BODYWEIGHT_EXERCISES = ['Push Ups','Pull Up','Chin Ups','Plank','Handstand Push Up','Nordic Hamstring Curl','Glute Ham Raise','Inverted Row','Ring Dips','Parallel Bars Dips','Dragon Flag','Sit Ups','Crunch','Leg Raise','Hyperextension','Bodyweight'];

const exercises = entries.map((entry, i) => {
  const [muscle, rawFile] = entry.split('/');
  const rawName = rawFile.replace(/\.[^.]+$/, ''); // remove extension if any
  const name = rawName
    .replace(/_/g, ' ')
    .replace(/\bDumbell\b/g, 'Dumbbell')
    .replace(/\bNeutural\b/g, 'Neutral')
    .replace(/\bStnading\b/g, 'Standing')
    .replace(/\bHanner\b/g, 'Hammer')
    .replace(/\bFlorr\b/g, 'Floor')
    .replace(/\bHyght\b/g, 'High')
    .replace(/\bSaftey\b/g, 'Safety')
    .replace(/\bCurtsey\b/g, 'Curtsy')
    .replace(/\bHyperextention\b/g, 'Hyperextension')
    .replace(/\bBedind\b/g, 'Behind')
    .replace(/\bDicline\b/g, 'Decline')
    .replace(/\bStantinding\b/g, 'Standing')
    .trim();

  const isBodyweight = BODYWEIGHT_EXERCISES.some(bw => name.includes(bw));

  return {
    id: i + 1,
    name,
    muscle,
    equipment: detectEquipment(name),
    isBodyweight,
    image: entry,
  };
});

fs.writeFileSync('exercises_seed.json', JSON.stringify(exercises, null, 2));

const byMuscle = {};
exercises.forEach(e => byMuscle[e.muscle] = (byMuscle[e.muscle]||0)+1);
console.log(`Generated ${exercises.length} exercises`);
console.log(byMuscle);
