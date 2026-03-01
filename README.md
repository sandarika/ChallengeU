# ChallengeU - University of Nebraska Lincoln
*Raikes Hacks 2026*

Get out there! 💪 ChallengeU connects UNL students with recreation opportunities, social events, and fitness communities across campus.

---

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- macOS with Xcode (for iOS builds)
- CocoaPods (`sudo gem install cocoapods` if not installed)

### Installation

1. Navigate to the ChallengeU folder:
   ```bash
   cd ChallengeU
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Run as iOS Development Build (recommended)

1. Generate native iOS files:
   ```bash
   npx expo prebuild --platform ios
   ```

2. Build and install on iOS simulator or connected device:
   ```bash
   npx expo run:ios
   ```
   Or target a specific simulator/device:
   ```bash
   npx expo run:ios --device <SIMULATOR_OR_DEVICE_ID>
   ```

3. Start Metro for the development client:
   ```bash
   lsof -ti :8081 | xargs kill -9 2>/dev/null || true
   npx expo start --dev-client --host lan --port 8081 --clear
   ```

4. Open the installed ChallengeU app.

If app does not auto-connect, open by URL:
```bash
exp://<YOUR_LOCAL_IP>:8081
```

### Optional: Expo Go (UI-only)

Some native features (for example Apple Health/Calendar behavior) require a development build.

```bash
npx expo start
```

---

## About ChallengeU

ChallengeU is the all-in-one app for UNL students looking to stay active and connected. Whether you want to hit the gym, join a pickup game, find your next adventure, or connect with club sports teams, ChallengeU makes it easy.

The current repository includes a frontend scaffold with a login screen and tabbed navigation. Tabs correspond to the major features described below (Activity Hub, Meetup, Activity Feed, Teams) and are styled in the scarlet‑and‑cream brand palette.

### Features

🏋️ **Real-Time Activity Hub** - Check the live status and busyness of recreation facilities across campus:
- Rec Center capacity and available equipment
- Outdoor Adventure Center schedules
- Sand volleyball courts and tennis court availability
- Gym busy times

💬 **Social Events Platform** - Start and organize games with other students:
- Create and discover events (basketball, soccer, hiking, etc.)
- Built-in calendar integration
- RSVP and participant tracking
- Real-time messaging with event organizers and teammates

📊 **Activity Feed & Fitness Tracking** - Stay motivated and social:
- Share your workouts and activities
- View in-app fitness progress snapshots
- Follow friends and see what they're up to
- Celebrate milestones together

🏆 **Club & Intramural Sports** - Find your team:
- Browse UNL club and intramural sports teams
- Team schedules and rosters
- Event information and registration
- Connect with teammates

---

## Project Structure

```
├── App.tsx             # Main app component (TypeScript)
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── assets/             # App icons and images
├── server/             # Node.js backend
│   └── index.js        # Express server setup
└── README.md           # This file
```

---

## Tech Stack

**Frontend:**
- React Native with Expo
- TypeScript
- Platforms: iOS, Android, Web

**Backend:**
- Node.js with Express
- MongoDB (Mongoose ODM)
- JWT Authentication
- REST API

---

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- Questions? Check out [Snack.expo.dev](https://snack.expo.dev/) for quick examples
