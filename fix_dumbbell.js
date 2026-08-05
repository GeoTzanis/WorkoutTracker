const fs = require('fs');
const exercises = JSON.parse(fs.readFileSync('exercises_seed.json', 'utf8'));

const DUMBBELL_LIST = [
  // Back
  'Bench Supported Dumbbell Row',
  'Dumbbell Bent Over Reverse Row',
  'Dumbbell Deadlift',
  'Dumbbell Shrug',
  'Dumbbell Bent Over Row Lats',
  'Dumbbell Hammer Grip Incline Bench Row',
  'Incline Row',
  'Seal Row Dumbbells',
  // Biceps
  'Alternate Bicep Curl',
  'Alternate Dumbbell Incline Curl',
  'Alternate Hammer Preacher Curls',
  'Arm Blaster Bicep Curl',
  'Bicep Curl',
  'Cross Body Hammer Curls',
  'Drag Dumbbell Curl',
  'Dumbbell Alternate Bicep Curl',
  'Dumbbell Incline Curl',
  'Dumbbell Zottman Preacher Curl',
  'Dumbbell Alternate Seated Hammer Curls',
  'Dumbbell Hammer Preacher Curl',
  'Dumbbell Incline Hammer Curl',
  'Dumbbell Preacher Curl',
  'Dumbbell Seated Double Concentration Curl',
  'Hammer Curl',
  'Incline Dumbbell Curl',
  'Lying Dumbbell Curl',
  'Incline Inner Dumbbell Curl',
  'Reverse Spider Dumbbell Curl',
  'Seated Drag Dumbbell Curl',
  'Seated Dumbbell Curl',
  'Seated Dumbbell Hammer Curl',
  'Zottman Dumbbell Curl',
  // Calves
  'Dumbbell Seated Calf Raise',
  'Standing Dumbbell Calf Raise',
  // Chest
  'Decline Dumbbell Fly',
  'Decline Dumbbell Press',
  'Dumbbell Bench Press',
  'Dumbbell Close Grip Press',
  'Dumbbell Floor Fly',
  'Dumbbell Squeeze Press',
  'Dumbbell Standing Low Fly',
  'Flat Dumbbell Fly',
  'Floor Dumbbell Bench Press',
  'Hyght Dumbbell Fly',
  'Incline Dumbbell Fly',
  'Incline Dumbbell Press',
  'Incline Hammer Press',
  'Lying Hammer Press',
  'Reverse Dumbbell Press',
  // Forearms
  'Arm Blaster Hammer Curls',
  'Cross Body Hammer Curl',
  'Dumbbell Behind The Back Curl',
  'Dumbbell Preacher Hammer Curl',
  'Dumbbell Reverse Wrist Curl',
  'Dumbbell Wrist Curl',
  'Finger Curls',
  'Over Bench Neutral Wrist Curl',
  'Over Bench Reverse Wrist Curl',
  'Over Bench Wrist Curl',
  'Reverse Curls',
  'Seated Neutral Wrist',
  'Standing Dumbbell Reverse Curls',
  'Standing Dumbbell Wrist Curl',
  'Weighted Seated Neutral Wrist Curl',
  'Weighted Seated Supination',
  // Legs
  'Dumbbell Stiff Leg Deadlift',
  'Dumbbell RDL Death March',
  'Dumbbell Deadlift',
  'Dumbbell Lunge',
  'Dumbbell Squat',
  'Romanian Deadlift Dumbbells',
  // Shoulders
  'Arnold Press',
  'Chest Supported Dumbbell Incline Front Raise',
  'Chest Supported Dumbbell Lateral Raise',
  'Dumbbell Standing Overhead Press',
  'Dumbbell Front Raise',
  'Dumbbell Hammer Grip Press',
  'Dumbbell Incline Y Raise',
  'Dumbbell Lateral Raise',
  'Dumbbell Upright Row',
  'Dumbbell Shoulder Press',
  'Incline Rear Delt Fly',
  'Seated Dumbbell Rear Delt Fly',
  'Seated Front Raise',
  'Seated Lateral Raise',
  // Triceps
  'Dumbbell Incline Triceps Extension',
  'Dumbbell Lying Floor Skull Crusher',
  'Dumbbell Lying Triceps Extension',
  'Incline Triceps Extension',
  'Standing Dumbbell Kickback',
];

const normalize = (s) => s.toLowerCase().replace(/[_\s-]+/g, ' ').replace(/dumbell/g, 'dumbbell').replace(/hanner/g, 'hammer').replace(/dumbell/g, 'dumbbell').trim();

let changed = 0;
const updated = exercises.map(e => {
  const exNorm = normalize(e.name);
  const shouldBeDumbbell = DUMBBELL_LIST.some(d => normalize(d) === exNorm || exNorm.includes(normalize(d)));
  if (shouldBeDumbbell && e.equipment !== 'Dumbbell') {
    changed++;
    console.log(`CHANGED: ${e.name} (${e.equipment} → Dumbbell)`);
    return { ...e, equipment: 'Dumbbell' };
  }
  return e;
});

fs.writeFileSync('exercises_seed.json', JSON.stringify(updated, null, 2));
console.log(`\nDone. ${changed} exercises updated to Dumbbell.`);
