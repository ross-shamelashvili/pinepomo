# Pomodoro App Architecture RFC

**Cross-Platform Timer with Plugin Ecosystem**

- **Author:** Ross (with Claude AI)
- **Date:** January 6, 2025
- **Status:** Final - Reviewed by Gemini & ChatGPT
- **Version:** 4.0

## Revision History

| Ver | Date       | Changes                                                    |
| --- | ---------- | ---------------------------------------------------------- |
| 1.0 | 2025-01-06 | Initial draft                                              |
| 2.0 | 2025-01-06 | Added Gemini feedback: Vercel, CI/CD, testing              |
| 3.0 | 2025-01-06 | Added ChatGPT feedback: StoragePort, Immer, event_id, timezones |
| 4.0 | 2025-01-06 | Added Obsidian plugin + Todoist extension as P0 components |

## 1. Executive Summary

This document proposes an architecture for an open-source Pomodoro timer ecosystem consisting of:

- Standalone apps (Web, macOS, Linux, iOS)
- Obsidian plugin — trigger and view timer from within Obsidian
- Todoist browser extension — start pomodoro from any Todoist task

All components share the same core logic and sync to the same backend, providing a unified experience whether you start a timer from Obsidian, Todoist, or the standalone app.

## 2. Requirements

### 2.1 Component Matrix

| Component              | Priority | Notes                              |
| ---------------------- | -------- | ---------------------------------- |
| Web App                | P0       | PWA, deployed on Vercel            |
| macOS Desktop App      | P0       | Tauri, menu bar presence           |
| Linux Desktop App      | P0       | Tauri, Omarchy compatible          |
| iOS App                | P0       | Expo, background timer support     |
| Obsidian Plugin        | P0       | TypeScript, command palette + status bar |
| Todoist Browser Extension | P0    | Chrome/Firefox, button on tasks    |
| Apple Watch App        | P2       | Deferred to v2                     |
| Android App            | P2       | Deferred, no test device           |

### 2.2 Functional Requirements

- **Core Timer:** Configurable work/break durations (default 25/5)
- **Multi-Entry Points:** Start timer from app, Obsidian, or Todoist
- **Sync:** Timer state syncs across all entry points and devices
- **Offline Support:** Works without network connectivity
- **Todoist Integration:** Attach pomodoros to tasks
- **Obsidian Integration:** Log completed pomodoros to daily notes

## 3. Architecture

### 3.1 High-Level Overview

The architecture consists of three layers: trigger points (where users interact), shared core (timer logic), and sync backend:

```
┌─────────────────────────────────────────────────────────────┐
│                     TRIGGER POINTS                          │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │
│  │ Obsidian │ │ Todoist  │ │  Web   │ │Desktop │ │ iOS   │ │
│  │ Plugin   │ │Extension │ │  App   │ │  App   │ │ App   │ │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └───┬────┘ └───┬───┘ │
└───────┼────────────┼───────────┼──────────┼──────────┼─────┘
        │            │           │          │          │
        └────────────┴─────┬─────┴──────────┴──────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  @pomodoro/core (TypeScript)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │Timer + State│ │ StoragePort │ │   Events    │           │
│  │  (Zustand)  │ │ (Abstract)  │ │  (Emitter)  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SYNC BACKEND                             │
│              Supabase (Auth + Postgres + Realtime)          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Technology Stack

| Layer        | Technology          | Notes                          |
| ------------ | ------------------- | ------------------------------ |
| Monorepo     | pnpm + Turborepo    | Shared across all packages     |
| Core Logic   | TypeScript          | Consumed by all trigger points |
| State        | Zustand + Immer     | Timer state machine            |
| Web App      | Vite + React        | Deployed on Vercel             |
| Desktop Apps | Tauri v2            | macOS + Linux                  |
| iOS App      | Expo                | Background timer support       |
| Obsidian Plugin | TypeScript       | Obsidian Plugin API            |
| Todoist Extension | TypeScript     | WebExtension API (Chrome/Firefox) |
| Backend      | Supabase            | Auth, Postgres, Realtime       |

### 3.3 Project Structure

```
pomodoro/
├── packages/
│   ├── core/                 # Shared TypeScript logic
│   │   ├── timer/            # Zustand + Immer state machine
│   │   ├── storage/          # StoragePort interface
│   │   ├── sync/             # Supabase client
│   │   ├── events/           # Event emitter
│   │   └── integrations/     # Todoist/Obsidian API clients
│   │
│   ├── web/                  # Vite + React (Vercel)
│   ├── desktop/              # Tauri (macOS + Linux)
│   ├── mobile/               # Expo (iOS)
│   │
│   ├── obsidian-plugin/      # Obsidian plugin
│   │   ├── main.ts           # Plugin entry
│   │   ├── commands.ts       # Command palette commands
│   │   ├── status-bar.ts     # Timer status display
│   │   └── settings.ts       # Plugin settings tab
│   │
│   └── todoist-extension/    # Browser extension
│       ├── manifest.json     # WebExtension manifest
│       ├── content.ts        # Inject button into Todoist
│       ├── background.ts     # Timer state (service worker)
│       └── popup/            # Extension popup UI
│
├── supabase/                 # Migrations, edge functions
├── .github/workflows/        # CI/CD
└── docs/
```

## 4. Obsidian Plugin

### 4.1 Features

- **Command Palette:** Start/pause/cancel pomodoro
- **Status Bar:** Show current timer (e.g., "🍅 12:34")
- **Task from Note:** Use current note title as task name
- **Auto-Log:** Append completed pomodoros to daily note
- **Hotkeys:** Configurable keyboard shortcuts

### 4.2 Technical Approach

The plugin imports @pomodoro/core directly. Since Obsidian runs on Electron, we have full Node.js access:

```typescript
// obsidian-plugin/main.ts
import { Plugin } from 'obsidian';
import { createTimerStore, syncClient } from '@pomodoro/core';

export default class PomodoroPlugin extends Plugin {
  private timerStore = createTimerStore();

  async onload() {
    // Sync on startup
    await syncClient.pull();

    // Add commands
    this.addCommand({
      id: 'start-pomodoro',
      name: 'Start Pomodoro',
      callback: () =>
        this.timerStore.start({
          taskName: this.app.workspace.getActiveFile()?.basename,
        }),
    });

    // Status bar
    this.addStatusBarItem().setText(this.getTimerDisplay());
  }
}
```

### 4.3 Storage

The plugin uses Obsidian's built-in data storage for settings, and @pomodoro/core's sync client for timer state. This means timer state is shared with other apps automatically.

## 5. Todoist Browser Extension

### 5.1 Features

- **Task Button:** "Start Pomodoro" button on each Todoist task
- **Popup UI:** View timer, pause/cancel from extension icon
- **Badge:** Show remaining time on extension icon
- **Notifications:** Browser notification when timer completes

### 5.2 Technical Approach

The extension consists of three parts:

| Component      | Purpose                                                       |
| -------------- | ------------------------------------------------------------- |
| Content Script | Injects "Start Pomodoro" button into Todoist DOM; extracts task name and ID |
| Service Worker | Runs @pomodoro/core timer; manages sync; updates badge        |
| Popup          | Small UI showing current timer; pause/cancel controls         |

```typescript
// todoist-extension/content.ts
// Inject button into Todoist task rows
const observer = new MutationObserver(() => {
  document.querySelectorAll('.task_item').forEach((task) => {
    if (!task.querySelector('.pomodoro-btn')) {
      const btn = document.createElement('button');
      btn.className = 'pomodoro-btn';
      btn.textContent = '🍅';
      btn.onclick = () => {
        const taskName = task.querySelector('.task_content')?.textContent;
        const taskId = task.dataset.itemId;
        chrome.runtime.sendMessage({
          type: 'START_POMODORO',
          payload: { taskName, todoistTaskId: taskId },
        });
      };
      task.appendChild(btn);
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });
```

### 5.3 Sync Approach

The extension's service worker imports @pomodoro/core and uses the sync client. Timer state is pushed to Supabase and available in all other apps immediately.

## 6. Sync Architecture

### 6.1 Design: Local-First with Central Sync

Each trigger point maintains its own local state. On any timer action, the change is pushed to Supabase. On app/plugin open, state is pulled from Supabase. This ensures all entry points stay in sync.

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Obsidian   │    │   Todoist   │    │  Standalone │
│   Plugin    │    │  Extension  │    │     App     │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │    push/pull     │    push/pull     │
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
               ┌─────────────────────┐
               │     Supabase        │
               │  (Source of Truth)  │
               └─────────────────────┘
```

### 6.2 Database Schema

```sql
-- pomodoro_sessions
id              UUID PRIMARY KEY
event_id        UUID UNIQUE        -- Clock skew protection
device_id       TEXT               -- Source identifier
user_id         UUID REFERENCES auth.users
started_at      TIMESTAMPTZ        -- Always UTC
ended_at        TIMESTAMPTZ        -- Always UTC
duration_mins   INTEGER DEFAULT 25
status          TEXT CHECK (status IN ('running','paused','completed','cancelled'))
task_name       TEXT
todoist_task_id TEXT
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()

-- user_settings
user_id         UUID PRIMARY KEY
work_mins       INTEGER DEFAULT 25
break_mins      INTEGER DEFAULT 5
long_break_mins INTEGER DEFAULT 15
daily_goal      INTEGER DEFAULT 8
timezone        TEXT DEFAULT 'UTC'
updated_at      TIMESTAMPTZ DEFAULT now()
```

## 7. Deployment

| Component        | Target                        | Automation              |
| ---------------- | ----------------------------- | ----------------------- |
| Web App          | Vercel                        | Auto-deploy on push     |
| Desktop Apps     | GitHub Releases               | GitHub Actions on tag   |
| iOS App          | App Store                     | EAS Build via Actions   |
| Obsidian Plugin  | Obsidian Community Plugins    | GitHub Actions on tag   |
| Todoist Extension| Chrome Web Store + Firefox Add-ons | GitHub Actions on tag |
| Backend          | Supabase Cloud                | supabase db push        |

## 8. Testing Strategy

| Layer            | Tool           | Focus                          |
| ---------------- | -------------- | ------------------------------ |
| Core Unit Tests  | Vitest         | Timer state machine, sync logic |
| Property Tests   | fast-check     | Timer state transition sequences |
| Web E2E          | Playwright     | Full user flows                |
| Mobile E2E       | Maestro        | iOS flows, background timer    |
| Obsidian Plugin  | Manual + Vitest| Command execution, status bar  |
| Browser Extension| Playwright + Manual | Content script injection, sync |

## 9. Implementation Plan

1. **Phase 1 - Foundation:** Monorepo setup, Vercel project, CI skeleton
2. **Phase 2 - Core:** Timer state machine, StoragePort, tests
3. **Phase 3 - Web App:** Vite + React, deployed to Vercel
4. **Phase 4 - Backend:** Supabase, auth, sync
5. **Phase 5 - Desktop:** Tauri wrapper, GitHub Releases
6. **Phase 6 - Mobile:** Expo iOS, EAS Build
7. **Phase 7 - Obsidian Plugin:** Commands, status bar, daily note logging
8. **Phase 8 - Todoist Extension:** Content script, popup, Chrome/Firefox
9. **Phase 9 - Polish:** E2E tests, docs, open source release

## Appendix: Review Summary

This architecture was reviewed by Google Gemini and OpenAI ChatGPT. Both validated the core decisions. Key additions from their feedback:

- Zustand + Immer for readable state transitions
- StoragePort pattern for cross-platform SQLite
- event_id + device_id for clock skew protection
- Property-based tests (fast-check) for timer state
- Store all times in UTC
- Core emits events; platforms own notifications
- Let Vercel own web CI entirely
