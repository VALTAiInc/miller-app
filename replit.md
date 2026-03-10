# Continuum Systems - Advanced MIG Intelligence

## Overview
A web-based welding intelligence assistant for Miller Continuum welding equipment. Converted from a React Native/Expo mobile app to a full-stack web application.

## Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI via Replit AI Integrations (gpt-4o-mini for chat, gpt-4o-mini-transcribe for STT)
- **Audio**: Browser MediaRecorder API for voice input, ffmpeg for format conversion

## Key Features
1. **Home** - Landing page with hero image, logo, quick access links
2. **Talk/Chat** - AI chat assistant specialized in welding (text + voice input)
3. **Blueprints/Reference** - Parameter charts for MIG steel/aluminum/stainless, troubleshooting guides
4. **Procedures** - Searchable, expandable procedure library
5. **Job Log** - CRUD for recording welding job settings and outcomes

## Project Structure
```
client/src/
  pages/           - home, talk, blueprints, procedures, job-log
  components/      - bottom-nav, ui/ (shadcn)
  lib/             - queryClient
server/
  index.ts         - Express server entry
  routes.ts        - API routes (chat, job-log, transcribe)
  storage.ts       - Database CRUD operations
  db.ts            - Drizzle database connection
  seed.ts          - Demo data seeding
shared/
  schema.ts        - Drizzle schema (conversations, messages, jobLogEntries)
```

## Design
- Dark theme with Miller Blue (#006bae) as primary accent
- Mobile-first with bottom tab navigation
- Font: Open Sans (sans), Georgia (serif), Menlo (mono)

## Environment
- DATABASE_URL - PostgreSQL connection
- AI_INTEGRATIONS_OPENAI_API_KEY - Replit AI integrations (auto-set)
- AI_INTEGRATIONS_OPENAI_BASE_URL - Replit AI integrations (auto-set)
- SESSION_SECRET - Express session secret
