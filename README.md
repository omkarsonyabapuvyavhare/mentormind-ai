# MentorMind AI

MentorMind AI is an adaptive learning application that:

- parses free-form learning goals
- generates a personalized roadmap
- generates lesson content and 5-question topic check-ins
- tracks learner signals in a deterministic decision engine
- adapts plan, remediation, mastery acceleration, and accountability nudges

This repository is prepared for hackathon demo use and local development.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Zustand
- Vitest + Testing Library
- Tailwind CSS
- Gemini API (`@google/genai`) with deterministic fallbacks

## Prerequisites

Install on your machine:

- Node.js (LTS recommended; Node 20+ verified)
- npm
- Git

No global npm packages are required for app startup/build/test.

## Clone and Setup

```bash
git clone <your-repo-url>
cd mentormind-ai
npm install
```

## Environment Setup

Create a local env file from template:

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` values as needed.

### Environment Variables

Required for live Gemini generation (app still runs without this using deterministic fallbacks):

- `GEMINI_API_KEY`

Optional:

- `GEMINI_MODEL` (default: `gemini-3-flash-preview`)
- `AI_INTENT_PARSE_TIMEOUT_MS`
- `AI_ROADMAP_GENERATE_TIMEOUT_MS`
- `AI_LESSON_GENERATE_TIMEOUT_MS`
- `NEXT_PUBLIC_SITE_URL`

Presenter mode:

- `NEXT_PUBLIC_PRESENTER_MODE=false` (set `true` only for presenter/demo sessions)

Development-only behavior:

- `NODE_ENV=development` enables additional debug logging paths (do not set manually in normal usage).

## Running Locally

Start dev server:

```bash
npm run dev
```

Default URL: `http://localhost:3000`

## Tests

Run the full test suite:

```bash
npm test
```

## Production Build

Build production artifacts:

```bash
npm run build
```

Run production server locally:

```bash
npm run start
```

## Presenter Mode

Presenter controls can be enabled by either:

- setting `NEXT_PUBLIC_PRESENTER_MODE=true`, or
- using presenter query/bootstrap flow in supported routes

Keyboard shortcuts (when presenter mode is active):

- `Alt+4` simulate weak score flow
- `Alt+1` simulate mastery score flow
- `Alt+R` reset journey

## Project Structure

```text
mentormind-ai/
  src/                  # application code (app router, components, libs, stores)
  public/               # static assets
  tests/                # vitest suite
  scripts/              # verification/utility scripts
  .env.example          # environment template
  package.json          # scripts and dependencies
```

## Deployment (Vercel)

### Preview Deployments

- Connect the repository to Vercel.
- Framework: Next.js (auto-detected).
- Build command: `npm run build` (default works).
- Install command: `npm install` (default works).

### Production Deployments

- Promote from preview or deploy from main branch.
- Configure environment variables in Vercel project settings:
  - `GEMINI_API_KEY` (required for live AI generation)
  - Optional overrides from `.env.example` as needed

### Vercel Configuration

- No `vercel.json` is required for current setup.
- Default Next.js Vercel behavior is sufficient.

## Troubleshooting

- **PowerShell `npm` execution policy error**: use `npm.cmd <command>` instead of `npm <command>`.
- **Gemini key missing**: app will continue via deterministic fallback content.
- **Presenter controls not visible**: verify `NEXT_PUBLIC_PRESENTER_MODE=true` and route context.
- **Port already in use**: run `npm run dev -- --port <port>`.
- **Optional runtime verification scripts fail on Playwright path**: some scripts currently expect a Cursor-managed Playwright path under `%TEMP%/pw-temp/node_modules/playwright`; this is not required for normal app startup/build/test.

## Hackathon Fresh-Laptop Checklist

Use this sequence on a clean machine:

1. `git clone <repo-url>`
2. `cd mentormind-ai`
3. `npm install`
4. `cp .env.example .env.local` (or PowerShell equivalent)
5. Set `GEMINI_API_KEY` in `.env.local` (optional but recommended for live AI)
6. `npm run dev`
7. `npm run build`
8. `npm test`

If steps 3, 6, 7, and 8 succeed, the repository is ready for hackathon handoff.
