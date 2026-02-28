# ChallengeU - University of Nebraska Lincoln
*Raikes Hacks 2026*

Get out there! 💪 ChallengeU connects UNL students with recreation opportunities, social events, and fitness communities across campus.

---

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation & Running

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open on your device:
   - **iOS (on macOS):** `npm run ios`
   - **Android:** `npm run android`
   - **Web:** `npm run web`

---

## About ChallengeU

ChallengeU is the all-in-one app for UNL students looking to stay active and connected. Whether you want to hit the gym, join a pickup game, find your next adventure, or connect with club sports teams, ChallengeU makes it easy.

The current repository includes a frontend scaffold with a login screen and tabbed navigation. Tabs correspond to the major features described below (Activity Hub, Events, Activity Feed, Teams) and are styled in the scarlet‑and‑cream brand palette.

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
- Sync with popular fitness trackers
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
└── README.md           # This file
```

---

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run ios` - Build and run on iOS simulator
- `npm run android` - Build and run on Android emulator
- `npm run web` - Run on web

---

## Tech Stack

- **Frontend:** React Native with Expo
- **Language:** TypeScript (ready)
- **Platforms:** iOS, Android, Web

---

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- Questions? Check out [Snack.expo.dev](https://snack.expo.dev/) for quick examples
