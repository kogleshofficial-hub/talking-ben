# Milo — a 3D AI dog

An original, browser-based 3D character prototype with voice input, natural AI responses, speech output, and interactive idle/speaking animations.

> This is an independent fan-made technical experiment. It is not affiliated with or endorsed by Outfit7. It does not include Talking Ben's proprietary 3D model, textures, audio, code, or other assets.

## What works in this starter

- A procedural Three.js character scene built from original geometry (no copied model files).
- Responsive UI for mobile and desktop.
- Voice input via the browser's Web Speech API when supported, plus typed input as a fallback.
- Open-ended AI replies through a server-side API route.
- Spoken replies using the browser's speech synthesis, with basic mouth/head animation while talking.
- Short in-memory conversation context within the current page session.
- Basic server-side input limits, output limits, and best-effort per-instance rate limiting.

## Requirements

- A Vercel account to deploy (or another host that supports Vercel-style /api functions).
- An OpenAI API key with API billing enabled. ChatGPT subscriptions and API billing are separate.
- A modern browser. Speech recognition support varies by browser; typed chat remains available.

## Run / deploy

1. Import this repository into Vercel.
2. In Project → Settings → Environment Variables, add:
   - OPENAI_API_KEY: your API key (server-side only; never put it in frontend code).
   - Optional OPENAI_MODEL: model name enabled for your API project. The default is gpt-4.1-mini.
3. Deploy.
4. Open the deployed site, allow microphone permission, and tap Talk to Milo. If voice recognition is not supported, type in the chat box instead.

For local development, install Node.js and the Vercel CLI, then run vercel dev. Do not commit .env.local or any API key.

## Safety, cost, and privacy notes

- Each AI request can incur API charges. Set usage alerts/limits in the API provider dashboard before sharing publicly.
- The API route includes small request/response limits and in-memory rate limiting. That limit is best-effort and is not a substitute for a shared rate limiter or abuse protection for a viral public launch.
- Microphone use requires browser permission. Browser speech recognition may send audio to the browser vendor's recognition service; check your browser/provider settings. The app does not save microphone recordings.
- Conversation text is kept in the page's memory for the current session and is sent to the configured AI provider when you submit a message.
- Browser speech synthesis uses voices available on the user's device; it is not the original Talking Ben voice.
- This prototype is not guaranteed error-free and should be tested across target phones and browsers before public promotion.

## Roadmap

1. Validate mobile microphone behavior and 3D performance.
2. Add real rigged character assets created in Blender or licensed from a suitable source.
3. Add better viseme-based lip sync, blinking, expression states, and interruptible voice playback.
4. Add shared rate limiting, analytics with consent, and operational monitoring before exposing an API-backed public demo.
5. Commission or license any art, music, or voices needed for a commercial release.

Created by Koglesh R. Murugan.
