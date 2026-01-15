# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pinepomo is a cross-platform Pomodoro timer ecosystem. Currently implemented as a React PWA with Supabase backend, with planned expansions to desktop (Tauri), iOS (Expo), and Obsidian plugin.

## Monorepo Structure

```
pinepomo/
├── packages/
│   ├── core/           # @pinepomo/core - Shared timer state machine (Zustand + Immer)
│   └── web/            # @pinepomo/web - React Vite PWA
├── supabase/           # Database migrations
└── docs/               # Architecture & Product docs
```

## Common Commands

```bash
# Install dependencies
pnpm install

# Development (starts all packages)
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run all tests
pnpm test

# Run single test file (from packages/core)
cd packages/core && pnpm vitest run src/timer/store.test.ts

# Watch mode for tests
cd packages/core && pnpm test:watch

# Format code
pnpm format
```

## Architecture

### Core Package (`packages/core/`)

The core package contains platform-agnostic timer logic using Zustand with Immer for immutable state updates.

Key files:
- `src/timer/store.ts` - Zustand store with state machine (start, pause, resume, cancel, tick)
- `src/storage/port.ts` - Abstract StoragePort interface allowing different storage implementations per platform
- `src/events/emitter.ts` - Event emission system (platforms decide how to notify users)
- `src/types.ts` - TimerStatus, TimerSession, TimerConfig types

Testing uses Vitest with fast-check for property-based testing of timer invariants.

### Web Package (`packages/web/`)

React PWA with Tailwind CSS and Supabase integration.

Key patterns:
- `src/hooks/useSync.ts` - Local-first sync with Supabase as source of truth
- `src/hooks/useAuth.ts` - Magic link authentication
- `src/lib/supabase.ts` - Supabase client instance
- `src/App.tsx` - Main component integrating all hooks and state

Components are organized by feature: `auth/`, `timer/`, `settings/`, `stats/`, `progress/`.

### Supabase Backend

Tables: `user_settings`, `timer_sessions`

Auth: Magic link (email-based)

Environment variables needed:
```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Key Documentation

- `docs/ARCHITECTURE.md` - Technical architecture and future platform plans
- `docs/PRD.md` - Product requirements and user stories

## Tech Stack

- **Monorepo**: pnpm 9.15 + Turborepo
- **State**: Zustand + Immer
- **Web**: React 18, Vite, Tailwind CSS 4
- **Backend**: Supabase (Postgres + Auth)
- **Testing**: Vitest + fast-check
