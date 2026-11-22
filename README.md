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
| `OPENAI_BASE_URL` | no | Proxy or compatible endpoint. Empty means OpenAI. Keep `OPENAI_MODEL` as OpenAI's own model id so the SDK knows whether it is a reasoning model; otherwise it sends `temperature`, which a reasoning model behind a proxy rejects. |
| `OPENAI_REASONING_EFFORT` | no | Reasoning models only; leave empty for non-reasoning models. `gpt-5`, `gpt-5-mini`, `gpt-5-nano`: `minimal`, `low`, `medium` or `high`. `gpt-5.1` and later: `none`, `low`, `medium` or `high` (some also `xhigh`). A value the model does not accept makes every review fail; the reason shows only in the server terminal. Values outside the known list are ignored. |
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

Microphone access needs HTTPS.

**Simplest: deploy a Vercel preview.** It is served over HTTPS and works on any phone. Add the environment variables above in the project settings first.

**Local network.** Next 16 blocks dev asset requests from hosts other than `localhost` and the hostname the server was started with (`allowedDevOrigins`). `--experimental-https` makes a certificate for `localhost` only, unless you give a hostname. Start the server with your Mac's LAN IP as the hostname, which covers both:

```bash
npx next dev --experimental-https -H 192.168.x.x   # your Mac's LAN IP, e.g. from: ipconfig getifaddr en0
```

Open `https://192.168.x.x:3000` on the phone (same Wi-Fi). The Next docs say the dev server allows the hostname it was started with, so no `allowedDevOrigins` entry is needed for this; add one in `next.config.ts` only if you reach the server by another name.

The certificate comes from `mkcert`, so the phone must trust its root CA. Find it with `mkcert -CAROOT` (the `rootCA.pem` file), send it to the phone, and install it. On iOS: open the file, allow the profile, install it in Settings, then Settings > General > About > Certificate Trust Settings and switch on full trust for it.

## Troubleshooting

When a live review fails, the real cause (401 for the key, 404 for the model, 400 for the reasoning effort) is printed in the terminal running `npm run dev`. The browser only shows a generic message, so read it there.

## Deploying

Add the environment variables above where your host keeps them (for example Vercel project settings).

**Warning:** `/api/review` has no authentication or rate limit. Anyone with the URL can call it and spend your OpenAI credit. Do not share the URL publicly, or turn on deployment protection (for example Vercel Deployment Protection).

## Privacy

Chrome sends speech to Google's servers for recognition, and Safari's recognition may send audio to Apple. Your answers and the questions are sent to OpenAI through `/api/review`; OpenAI's data retention policy applies to those requests.
