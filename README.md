# Milo — a 3D AI dog

Milo is an original browser-based 3D character experiment by Koglesh R. Murugan. It pairs a procedural Three.js dog with an open-weight language model that runs locally in the visitor's browser.

## The $0 inference design

- **No paid AI inference API. No AI API key. No monthly inference credits.**
- WebLLM runs the language model on the visitor's own device using WebGPU.
- The first visit downloads the selected model and supporting runtime assets. This can be a large download; the browser may cache model files for later visits.
- After assets are downloaded, text generation runs on the device rather than calling an AI inference server.
- Browser speech synthesis speaks replies using available system voices. Voice recognition uses the browser's built-in Web Speech API where supported; typed chat remains available.
- The default model is SmolLM2-360M-Instruct-q4f32_1-MLC, selected to keep resource requirements comparatively small. Its responses are less capable than larger cloud models.

**Important:** this avoids per-message AI charges, but nobody can guarantee that every browser, CDN, hosting platform, or public model download will remain free and available forever. The public model weights may be downloaded from Hugging Face's file hosting; Milo does not call Hugging Face Inference Providers, does not use their inference credits, and does not require a Hugging Face token. WebLLM's runtime assets are also fetched from its public distribution locations.

## Device compatibility

WebLLM needs a browser/device with working WebGPU and enough available GPU memory. Some mobile devices and browser/GPU combinations may fail even if they expose WebGPU. If that happens, Milo reports the limitation instead of secretly switching to a paid cloud endpoint. The first model download may take several minutes on a slow connection.

Test on target Android phones and desktop browsers before promoting it widely. This prototype has not yet been performance-tested on every device.

## Deploy

1. Deploy this repository as a static site (it contains index.html).
2. No OPENAI_API_KEY or other AI credentials are required.
3. Open the deployed page over HTTPS.
4. Send a message. Milo loads the local WebLLM runtime and model when the first message is sent.
5. If WebGPU is unavailable, use a supported browser/device or use Milo's 3D scene as a visual demo.

For local development, install Node.js and the Vercel CLI, then run `vercel dev`. Do not add a paid inference API as an automatic fallback if maintaining a $0 inference promise matters to you.

## What's included

- Responsive dark interface for phones and desktop
- Procedural Three.js dog scene: idle motion, blinks, head and tail movement, simple speech-mouth animation
- Local WebLLM language-model initialization with download progress messages
- Short in-memory conversation history
- Browser speech recognition (when available), browser speech synthesis, and typed chat
- Share button, quick prompts, and error/status states
- No user account required for AI inference

## Next upgrades

1. Test WebGPU support and memory use on real mobile devices; adjust the model size if needed.
2. Improve streaming replies and interruptible voice playback.
3. Upgrade to a rigged, original 3D character and phoneme/viseme lip sync.
4. Add accessibility, privacy messaging, performance monitoring, and an original licensed voice/art package.
5. If sharing widely, avoid claiming every device supports local AI; make incompatibility clear before the model download.

## License / identity note

Milo is an independent experiment and is not affiliated with or endorsed by Outfit7. It does not include Talking Ben's proprietary 3D model, textures, audio, or other protected assets.

Created by Koglesh R. Murugan.
