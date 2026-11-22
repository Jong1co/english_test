# English Test (web)

A speaking-practice app: pick a situation, hear the question, answer out loud, get feedback and a next question written by GPT. Speech recognition and read-aloud use the browser; grading and next questions run on the server through OpenAI.

Built with Next.js 16 (App Router, Cache Components), React 19 and CSS Modules. The handover plan is at `/Users/rovigos/Desktop/personal/english_test/docs/superpowers/plans/2026-11-21-nextjs-web-port.md`.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

| Variable | Required | Meaning |
| --- | --- | --- |
| `OPENAI_API_KEY` | yes | OpenAI API key. Read on the server only. |
| `OPENAI_MODEL` | yes | Model id. No default. |
| `OPENAI_BASE_URL` | no | Proxy or compatible endpoint. Empty means OpenAI. |
| `OPENAI_REASONING_EFFORT` | no | For reasoning models: `none`, `minimal`, `low`, `medium`, `high`, `xhigh` or `max`. Other values are ignored. Use `low` or `none` for faster answers. |
| `NEXT_PUBLIC_AI_MODE` | no | `live` (default) or `sample`. Set at build time. |

Without the key and model, `/api/status` returns `not-configured` and the microphone is disabled.

## Try it without a microphone or model

```bash
NEXT_PUBLIC_AI_MODE=sample npm run dev
```

Sample mode walks every situation with hand-written answers and results.

## Check grading with the real model

In development, open `/dev/tutor-check`. It sends the ten sample answers to `/api/review` and lists the hand-written grade next to the model's grade, with the suggestion, next question and time per row. The page returns 404 in production builds.

## Tests

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Run all four before committing.

## Testing on a phone

Microphone access needs HTTPS. Either deploy, or run `next dev --experimental-https` and trust the generated certificate on the phone.

## Deploying

Add the environment variables above where your host keeps them (for example Vercel project settings).

**Warning:** `/api/review` has no authentication or rate limit. Anyone with the URL can call it and spend your OpenAI credit. Do not share the URL publicly, or turn on deployment protection (for example Vercel Deployment Protection).

## Privacy

Chrome sends speech to Google's servers for recognition.
