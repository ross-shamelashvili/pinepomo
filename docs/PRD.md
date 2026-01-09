# Pomodoro App - Product Requirements Document

- **Author:** Ross
- **Date:** January 6, 2025
- **Status:** Final
- **Version:** 2.0

## 1. Problem Statement

### 1.1 The Gap

The author uses Todoist for task management, Obsidian for knowledge management, and already has Todoist-Obsidian integration working. What's missing is the **focused work layer**: a way to time-box work on Todoist tasks and automatically log that time to Obsidian.

**Current pain points:**

- No pomodoro app integrates with both Todoist AND Obsidian
- Existing apps require switching context to a separate app to start a timer
- No cross-platform sync that works on Mac, Linux (Omarchy), iOS, and web
- Manual time logging is friction; it doesn't get done consistently

### 1.2 The Solution

Build a pomodoro timer ecosystem that can be triggered from **where you already are**:

- **From Obsidian:** Command palette → "Start Pomodoro"
- **From Todoist:** Button on task → "Start Pomodoro"
- **Standalone:** Full app when you need history, settings, or mobile access

All three entry points share the same timer state and sync across devices.

### 1.3 Why Open Source?

- **Extensibility:** Others can add integrations (Notion, Linear, etc.)
- **Trust:** Users can verify their data isn't harvested
- **Longevity:** Project survives if original author moves on

## 2. Target Users

### 2.1 Primary User (v1)

The author (Ross) — a senior software engineering manager who uses Todoist + Obsidian daily, works across Mac, Linux (Omarchy), iOS, and values workflow integration over feature count.

**Key behaviors:**

- Plans work in Todoist
- Takes notes and logs in Obsidian
- Already has Todoist-Obsidian sync via existing plugin
- Wants to start timers without leaving current context
- Frequently switches between devices mid-task

### 2.2 Secondary Users (Future)

| User Type              | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| OSS Contributors       | Developers who want to add integrations or platforms     |
| Todoist + Obsidian Users | Power users with the same workflow who discover the project |
| General PKM Users      | Users of other note/task systems once community adds integrations |

## 3. User Stories

### 3.1 Trigger from Obsidian

**Story 1: Start pomodoro from current note**

> As a user in Obsidian, I want to press a hotkey to start a pomodoro for the note I'm working on so that I can begin focused work without context switching.

**Story 2: See timer status in Obsidian**

> As a user in Obsidian, I want to see the running timer in the status bar so that I know how much time remains without checking another app.

### 3.2 Trigger from Todoist

**Story 3: Start pomodoro from a task**

> As a user in Todoist, I want to click a button on a task to start a pomodoro so that the timer is automatically linked to that task.

**Story 4: See timer in browser**

> As a user browsing Todoist, I want to see the running timer in the extension icon so that I can track time without opening another tab.

### 3.3 Standalone App

**Story 5: Use app on mobile**

> As a user away from my desk, I want to start and manage pomodoros from my iPhone so that I can focus on work while mobile.

**Story 6: Continue timer across devices**

> As a user, I want to start a timer on desktop and see it on my phone so that I can move around without losing timer state.

### 3.4 Logging & Integration

**Story 7: Automatic Obsidian logging**

> As a user, I want completed pomodoros to appear in my Obsidian daily note so that I have a record without manual entry.

**Story 8: Work offline**

> As a user, I want to use the timer without internet so that network issues don't interrupt my focus.

## 4. Feature Requirements

### 4.1 Component Features

| Component       | Features                                        | Priority |
| --------------- | ----------------------------------------------- | -------- |
| Standalone App  | Full timer UI, settings, history, notifications | P0       |
| - Web           | PWA, Vercel deployment                          | P0       |
| - macOS         | Tauri, menu bar                                 | P0       |
| - Linux         | Tauri, Omarchy compatible                       | P0       |
| - iOS           | Expo, background timer                          | P0       |
| Obsidian Plugin | Commands, status bar, hotkeys, auto-log to daily note | P0 |
| Todoist Extension | Task button, popup, badge, Chrome + Firefox   | P0       |
| Cross-Device Sync | Supabase backend, eventual consistency        | P0       |
| Apple Watch     | Companion to iOS app                            | P2       |
| Android         | Expo supports it; needs test device             | P2       |

### 4.2 Core Timer Features

| Feature                      | Notes                       | Pri |
| ---------------------------- | --------------------------- | --- |
| Start / Pause / Resume / Cancel | Core timer controls      | P0  |
| Configurable durations       | Work/short break/long break | P0  |
| Notifications                | Timer complete, break over  | P0  |
| Task name / Todoist task linking | Attach pomodoro to specific task | P0 |
| Obsidian daily note logging  | Auto-append on complete     | P0  |
| Offline support              | Works without network       | P0  |
| Daily goal tracking          | Visual progress             | P1  |
| History view                 | Past pomodoros by day/week  | P1  |
| Keyboard shortcuts           | Desktop power-user feature  | P1  |

## 5. Key User Flows

### 5.1 Flow: Start Pomodoro from Obsidian

1. User is working on a note in Obsidian
2. User presses hotkey or opens command palette
3. User selects "Start Pomodoro"
4. Timer starts, task name = note title
5. Status bar shows "🍅 24:59" and counts down
6. Timer completes → notification
7. Entry added to daily note automatically

### 5.2 Flow: Start Pomodoro from Todoist

1. User is viewing tasks in Todoist (web)
2. User sees 🍅 button on each task (injected by extension)
3. User clicks 🍅 on a task
4. Timer starts, linked to that Todoist task
5. Extension icon shows remaining time as badge
6. Timer completes → browser notification
7. Entry logged to Obsidian (if connected)

### 5.3 Flow: Cross-Entry-Point Sync

1. User starts pomodoro from Todoist extension
2. User switches to Obsidian
3. Obsidian plugin status bar shows same running timer
4. User opens iOS app while away from desk
5. iOS app shows same timer with correct time remaining
6. User can pause/cancel from any entry point

## 6. Success Metrics

### 6.1 v1 Success Criteria (Personal)

- Author uses the system daily for 2+ weeks
- Author starts pomodoros from Obsidian and Todoist, not just standalone app
- Cross-device sync works without manual intervention
- Daily notes in Obsidian show accurate pomodoro log
- Author no longer uses any other pomodoro app

### 6.2 Open Source Success Criteria

| Timeframe | Metric                  | Target        |
| --------- | ----------------------- | ------------- |
| 3 months  | GitHub stars            | 100+          |
| 3 months  | External contributors   | 1+ merged PR  |
| 6 months  | Community integrations  | 1+ new integration |
| 6 months  | Obsidian plugin downloads | 500+        |

## 7. Scope Boundaries

### 7.1 Explicitly NOT in v1

- **Apple Watch** — Requires Swift
- **Android** — No test device
- **Team features** — Single-user only
- **Gamification** — No badges, streaks
- **Analytics/insights** — No weekly reports
- **Other integrations** — Notion, Linear, etc. (community can add)
- **AI features** — No auto-scheduling

### 7.2 Design Philosophy

- **Trigger from context** — Start timers where you already are
- **Invisible when working** — Timer runs; user focuses
- **Fast to start** — < 2 actions to start timer
- **Reliable sync** — Always show correct state everywhere

## 8. Business Model (Future)

If commercialization becomes relevant: **Free Local + Paid Sync**

| Tier      | Features                           | Price       |
| --------- | ---------------------------------- | ----------- |
| Free      | Full app + plugins, single device, local storage | $0 |
| Pro       | Cross-device sync, cloud backup    | ~$3-5/month |
| Self-Host | Full features, own Supabase        | $0 (OSS)    |

**Note:** Commercialization is not a v1 goal.

## 9. Related Documents

- [Architecture RFC v4](./ARCHITECTURE.md) — Technical architecture including plugins
- CONTRIBUTING.md — To be created
- README.md — Project overview
