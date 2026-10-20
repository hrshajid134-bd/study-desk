// Runs on the server. The API key is read from an environment variable and never sent to the browser.
const hits = new Map();

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  // Basic per-visitor limit: 30 questions per hour (resets when the function restarts).
  const ip = String(req.headers["x-forwarded-for"] || "x").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (recent.length >= 30) return res.status(429).json({ error: "rate_limited" });
  recent.push(now);
  hits.set(ip, recent);

  const { prompt, image, mime } = req.body || {};
  if (typeof prompt !== "string" || prompt.length > 12000) return res.status(400).json({ error: "bad_request" });

  const parts = [{ text: prompt }];
  if (image && /^image\//.test(mime || "")) parts.push({ inline_data: { mime_type: mime, data: image } });

  const model = process.env.AI_MODEL || "gemini-2.5-flash";
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.AI_API_KEY },
    body: JSON.stringify({ contents: [{ parts }] }),
  });
  if (!r.ok) return res.status(502).json({ error: "upstream_error" });

  const j = await r.json();
  const text = ((j.candidates && j.candidates[0] && j.candidates[0].content.parts) || []).map((p) => p.text || "").join("");
  res.status(200).json({ text });
};
