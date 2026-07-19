# FocusFlow

A task management and Pomodoro timer app built with Expo and React Native.

## Features

- **Today** — Journal-style daily task view with completion toggling
- **Tasks** — Full task index with today/upcoming/someday tabs, overdue and completed sections, swipe actions
- **Timer** — Pomodoro timer with work/break modes, task linking, session tally, and background notifications
- **Calendar** — Monthly grid with task dots and daily agenda list
- **Task Detail** — Bottom sheet for creating/editing tasks with due dates, times, priority, and notes
- **Reminders** — Local notifications at scheduled due times
- **Timer Notifications** — OS notifications on session completion with session counts

## Tech Stack

- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- [SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (local persistence via `expo-sqlite`)
- [Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) (animations and gestures)
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) (local notifications)

## Getting Started

```bash
npm install
npx expo start
```

Then open in a [development build](https://docs.expo.dev/develop/development-builds/introduction/), [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/), or [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/).
