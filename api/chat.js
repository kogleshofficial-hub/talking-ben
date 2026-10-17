const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 18;
const MAX_MESSAGE_CHARS = 900;
const MAX_HISTORY_ITEMS = 10;

// Best-effort in-memory limit. Use a shared rate limiter before a public viral launch.
const requestWindows = new Map();

function json(res, status, payload) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function getClientKey(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim().slice(0, 100);
  }
  return req.socket?.remoteAddress || "unknown";
}

function isRateLimited(key) {
  const now = Date.now();
  const entry = requestWindows.get(key);

  if (!entry || now - entry.startedAt >= WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const chunks = [];
  for (const item of data?.output || []) {
    for (const part of item?.content || []) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        chunks.push(part.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Use POST to send a message." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return json(res, 503, {
      error: "AI is not configured yet. The site owner needs to add OPENAI_API_KEY in the hosting environment variables."
    });
  }

  const clientKey = getClientKey(req);
  if (isRateLimited(clientKey)) {
    return json(res, 429, { error: "A little too fast! Wait a few seconds and try again." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return json(res, 400, { error: "The request body must be valid JSON." });
    }
  }

  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
  const messages = rawMessages
    .slice(-MAX_HISTORY_ITEMS)
    .filter((item) =>
      item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" &&
      item.content.trim().length > 0
    )
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_MESSAGE_CHARS)
    }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return json(res, 400, { error: "Send a message first." });
  }

  const latestUserMessage = messages[messages.length - 1].content;
  if (!latestUserMessage || latestUserMessage.length > MAX_MESSAGE_CHARS) {
    return json(res, 400, { error: "That message is too long. Try a shorter one." });
  }

  const instructions = [
    "You are Milo, an original fictional 3D cartoon dog character in a playful voice-chat demo.",
    "You are NOT Talking Ben and must not claim to be the original character or imitate a specific copyrighted character's exact voice or lines.",
    "Personality: curious, expressive, lightly sarcastic, warm, clever, and funny without being mean. Use short natural spoken answers, usually one or two sentences. Sound like a real conversation, not a help-desk bot. React specifically to what the person said. You may ask a single good follow-up when it keeps the conversation flowing.",
    "Don't start every answer with the same catchphrase. Avoid robotic bullet lists and overly formal wording. Match the user's language and tone when possible.",
    "Be honest when you don't know something. Don't pretend you can see or hear anything beyond the text supplied. Do not invent personal memories or real-world actions.",
    "Keep responses appropriate for a general audience, especially younger users. Do not encourage dangerous stunts, risky challenges, harassment, or harm. If asked to do something unsafe, briefly steer toward a safe alternative.",
    "The user may test you with jokes, absurd questions, or playful teasing. Respond naturally and with personality, but do not insult protected groups or make threats.",
    "Return only the spoken reply, with no labels, stage directions, markdown, or quotation marks."
  ].join(" ");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 22000);

    let upstream;
    try {
      upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          instructions,
          input: messages,
          max_output_tokens: 180,
          store: false
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("AI provider request failed:", upstream.status, data?.error?.code || "unknown");
      return json(res, 502, {
        error: "I couldn't think of a reply just now. Try once more in a moment."
      });
    }

    const reply = extractText(data);
    if (!reply) {
      return json(res, 502, { error: "I lost my words for a second. Try asking again." });
    }

    return json(res, 200, { reply: reply.slice(0, 1200) });
  } catch (error) {
    console.error("AI request error:", error?.name || "Error");
    const timedOut = error?.name === "AbortError";
    return json(res, timedOut ? 504 : 500, {
      error: timedOut
        ? "That took too long. Try a shorter question."
        : "Something went wrong on my side. Please try again."
    });
  }
}
