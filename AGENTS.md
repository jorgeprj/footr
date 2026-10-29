# AGENTS.md

## Project
Footr is a football-shirt retail management platform. MVP 0.1 focuses on a simple POS for events.

## Tech Stack
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase

## Architecture
Follow the conventions defined in `docs/architecture.md`:
- Use Feature-Sliced Design (FSD) to organize the frontend.
- Use Hexagonal Architecture for business logic.
- Keep business rules independent of frameworks, databases, and external services.
- Use ports and adapters for external integrations.
- Avoid unnecessary abstractions, dependencies, and complexity.

## Development Rules
- Keep code, files, and identifiers in English.
- User-facing interface must be in Brazilian Portuguese.
- Keep components focused and reusable.
- Validate data and permissions on the server.
- Never expose secrets or privileged credentials in client-side code.
- Preserve data isolation between stores.
- Do not implement future features unless explicitly requested.

## Before Finishing
Run `npm run lint` and `npm run build`. Fix any errors introduced by your changes.