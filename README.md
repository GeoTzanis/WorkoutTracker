# WorkoutTracker

A full-featured workout tracking app built with **React Native** and **Expo**, designed for serious gym-goers who want to track their training progress over time.

## Features

### Workout Logging
- Log sets, reps, and weight for any exercise
- Mark sets as complete with a checkmark — only completed sets count toward volume
- **Warm-up sets** — flagged separately and excluded from volume calculations
- **Unilateral sets** — log left and right side independently
- **Partials, Myo-Reps, Drop Sets** — advanced training techniques supported
- **Rest timer** — built-in countdown timer between sets
- **PR tracking** —  highlights when you hit a new personal record
- **Last session hints** — shows previous weight and reps as a reference
- Reorder exercises with  buttons

### Exercise Library
- 630+ exercises organized by muscle group
- Real exercise images for every movement
- Long press any exercise to see full-screen image preview
- Bodyweight exercises automatically use your bodyweight from settings
- Dumbbell exercises automatically double the weight (using two dumbbells)
- Add custom exercises to any muscle group

### Favorites
- Build workout templates with custom exercise selection and order
- Start a workout from a favorite with one tap
- Long press to edit or delete favorites
- Reorder exercises within a favorite

### Progress Tracking
- Full session history for every exercise
- View every set, rep, and weight from past workouts
- Personal record displayed at the top of each exercise history
- **Weekly volume chart** — bar chart of total training volume over 8 weeks
- **Body measurements tracker** — log weight, chest, waist, hips, arms, thighs

### Settings
- Profile setup (name, gender, bodyweight, height)
- Units toggle (kg / lbs)
- Dark / light mode
- Reset profile

## Tech Stack

- **React Native** — cross-platform mobile framework
- **Expo** (SDK 54) — build and deployment toolchain
- **AsyncStorage** — local data persistence
- **EAS Build** — production APK builds
- **Ionicons** — navigation icons

## Project Structure

```
WorkoutTracker/
├── App.js                  # Main application (single-file architecture)
├── App_content.js          # Source file — edit this, then run node write.js
├── exerciseImages.js       # Auto-generated static image map (630+ images)
├── exercises_seed.json     # Exercise database generated from image folders
├── write.js                # Copies App_content.js → App.js
├── generate_image_map.js   # Scans assets/exercises/ and generates exerciseImages.js
├── seed_from_images.js     # Reads exerciseImages.js and generates exercises_seed.json
├── assets/
│   ├── exercises/          # Exercise images organized by muscle group
│   │   ├── Chest/
│   │   ├── Back/
│   │   ├── Shoulders/
│   │   └── ...
│   ├── muscles/            # Muscle group icons for the library
│   └── nav/                # Navigation bar icons + app icon
├── app.json                # Expo configuration
└── eas.json                # EAS Build configuration
```

## Getting Started

### Prerequisites
- Node.js
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Expo Go app on your Android device

### Installation

```bash
git clone https://github.com/GeoTzanis/WorkoutTracker.git
cd WorkoutTracker
npm install
```

### Running in Development

```bash
node write.js
npx expo start --clear
```

Scan the QR code with Expo Go on your Android device.

### Adding or Reorganizing Exercises

If you add new images or move images between muscle group folders:

```bash
node generate_image_map.js   # Scans folders and updates exerciseImages.js
node seed_from_images.js     # Rebuilds the exercise database
node write.js                # Updates App.js
npx expo start --clear       # Restart with fresh cache
```

### Building a Production APK

```bash
$env:EAS_NO_VCS=1
eas build -p android --profile preview
```

Download and install the APK from the EAS build link.

## Screenshots

*Coming soon*

## License

MIT
