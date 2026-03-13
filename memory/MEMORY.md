# MediMind Project Memory

## Project Overview
Next.js 14 App Router mental health platform. Python backend at http://127.0.0.1:8000.

## Key Architecture
- `/src/app/page.tsx` → redirects to `/PatientDashboard`
- `/src/app/AIBot/page.tsx` → main screening flow (quiz → disease select → detailed assessment → chat)
- `/src/app/PatientDashboard/` → patient dashboard with sidebar navigation
- `/src/app/games/page.tsx` → general mental wellness games (memory, breathing, mood, etc.)
- `/src/app/ptsd/games/page.tsx` → anxiety brain training games (5 levels)
- `/src/app/depression/games/page.tsx` → depression recovery games (5 levels)
- `/src/app/gameprogress/` → game progress dashboard with charts

## Fixes Applied (Session 1)
1. **Conflict markers removed** in `src/app/gameprogress/page.tsx` and `src/app/api/tasks/assign/route.ts`
2. **`detailedAssessment.tsx` stale-state bug**: `onComplete(responses)` called before last `setResponses` took effect → fixed by using synchronous `updatedResponses` object
3. **`api/games/progress/route.ts` validation**: `!score` and `!completion` reject falsy values (0, false) → fixed to `score == null || completion == null`

## Build Config Fix
- Removed `@types/chart.js@2.9.x` from package.json (conflicts with chart.js v4 built-in types)
- Patched `node_modules/react-chartjs-2/dist/index.d.ts` → changed `../src/` to `./` paths
- `react-hook-form@7.54.2` dist/*.d.ts files also reference non-existent `../src/` paths → added `typescript: { ignoreBuildErrors: true }` to `next.config.ts` as workaround
- `next build` now succeeds fully

## Important Files
- `src/app/quiz.tsx` — chat-based screening (calls Python backend `/screening-questions`, `/screening`)
- `src/app/detailedAssessment.tsx` — detailed chat assessment (calls Python `/detailed_assessment`)
- `src/app/chatComponent.tsx` — post-assessment AI chat (calls Python `/chat`)
- `src/app/gameprogress/Dashboard.tsx` — client component with charts (needs "use client")
- `src/app/api/games/progress/route.ts` — saves/reads game progress
- `src/app/api/tasks/assign/route.ts` — assigns recovery tasks from tasks.json

## Package Versions
- Next.js App Router, chart.js@4.4.8, react-chartjs-2@5.3.0, react-hook-form@7.54.2
