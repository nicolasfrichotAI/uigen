# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint via next lint
npm test             # Run tests with Vitest
npm run db:reset     # Reset SQLite database (destructive)
```

`NODE_OPTIONS='--require ./node-compat.cjs'` is prepended to all Next.js commands — this patches out Web Storage globals during SSR for Node.js 25+ compatibility.

Set `ANTHROPIC_API_KEY` in `.env` to use Claude. Without it, the app falls back to a `MockLanguageModel` that generates static placeholder components.

## Architecture

UIGen is a Next.js 15 (App Router) application where users describe React components in a chat and Claude generates them into a virtual file system with a live preview.

### Request Lifecycle

1. User submits a message in `ChatInterface`
2. `ChatContext` (wrapping Vercel AI SDK's `useChat`) POSTs to `/api/chat` with the message history and current virtual file system state
3. `/api/chat/route.ts` calls `streamText()` with `claude-haiku-4-5` and two tools: `str_replace_editor` and `file_manager`
4. The AI's tool calls stream back to the client as data stream parts
5. `FileSystemContext.handleToolCall()` executes each tool call locally, mutating the virtual file system
6. Tool results are fed back to the AI in the next step (up to `maxSteps: 40`)
7. On completion, if the user is authenticated, the project (messages + files) is persisted to Prisma/SQLite

### Virtual File System

All files exist only in memory — nothing is written to disk. `VirtualFileSystem` (`src/lib/file-system.ts`) is the in-memory store. `FileSystemContext` wraps it with React state and handles AI tool dispatch. The preview iframe compiles JSX client-side via `@babel/standalone` through `src/lib/transform/jsx-transformer.ts`. Every project must have `/App.jsx` as the entry point.

### AI Tools

- **`str_replace_editor`** (`src/lib/tools/str-replace.ts`) — create, view, str_replace, insert, undo_edit on virtual files
- **`file_manager`** (`src/lib/tools/file-manager.ts`) — rename and delete virtual files

The system prompt lives in `src/lib/prompts/generation.tsx` and instructs Claude to use Tailwind CSS, keep `/App.jsx` as the entry, and use `@/` import aliases for local files.

### Authentication

JWT sessions stored in httpOnly cookies (7-day expiry). Logic is in `src/lib/auth.ts`. Server actions in `src/actions/index.ts` handle sign-up, sign-in, sign-out, and `getUser()`. Anonymous users can build without signing in; their work is tracked in localStorage via `src/lib/anon-work-tracker.ts` and migrated to their account on sign-up/sign-in.

### State Management

Two React contexts carry all shared state:

- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — message history, input state, submission handler
- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — virtual files, selected file, tool call handler

No external state library (no Redux/Zustand).

### Database

Prisma + SQLite (`prisma/dev.db`). Two models: `User` (email + bcrypt password) and `Project` (stores `messages` and `data`/files as JSON strings). Run `npx prisma studio` to inspect data.

### UI Layout

`src/app/main-content.tsx` renders a horizontally resizable two-panel layout: chat (left, ~35%) and a tabbed preview/code panel (right). shadcn/ui components are in `src/components/ui/`, built with Radix UI primitives and Tailwind CSS v4. The icon library is Lucide React.
