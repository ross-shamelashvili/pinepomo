# Pinepomo

Cross-platform Pomodoro timer with Obsidian plugin and Todoist browser extension.

## Overview

A pomodoro timer ecosystem that can be triggered from where you already are:
- **From Obsidian**: Command palette → "Start Pomodoro"
- **From Todoist**: Button on task → "Start Pomodoro"
- **Standalone**: Full app for history, settings, mobile access

All entry points share the same timer state and sync across devices.

## Platforms

- Web App (PWA, Vercel)
- macOS Desktop (Tauri)
- Linux Desktop (Tauri)
- iOS App (Expo)
- Obsidian Plugin
- Todoist Browser Extension (Chrome/Firefox)

## Tech Stack

- **Monorepo**: pnpm + Turborepo
- **Core**: TypeScript, Zustand + Immer
- **Web**: Vite + React
- **Desktop**: Tauri v2
- **Mobile**: Expo
- **Backend**: Supabase

## Status

🚧 Under Development

## License

MIT
