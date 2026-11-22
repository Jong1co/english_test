<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules

- Plan: `/Users/rovigos/Desktop/personal/english_test/docs/superpowers/plans/2026-11-21-nextjs-web-port.md` (written in Korean). Read it and the two specs it names before changing behaviour.
- Source Expo repo (read only, never modify): `/Users/rovigos/Desktop/personal/english_test`. "Copy" files come from there unchanged.
- Global constraints (summary):
  - All app copy is English, sentence case, no exclamation marks or emoji; buttons start with a verb.
  - Use design tokens (CSS variables) only; no hex values in components, except inside the 3D art SVGs.
  - One filled (`accentSolid`) button per screen.
  - Must work at 320-480px wide; on desktop it is a centred 480px column.
  - OpenAI key and model are read on the server only (no `NEXT_PUBLIC_`); import `@ai-sdk/openai` and `openai-provider.ts` only from `import 'server-only'` files.
  - Prompts, schemas, `toReview`, `marks.ts`, flow reducer and existing copy match the Expo code character for character.
  - Type classes go on the element that holds the text, never on flex or grid rows.
- Gate before every commit: `npm test && npm run lint && npm run typecheck && npm run build`.
