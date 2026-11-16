// Intermediário entre o formulário (GitHub Pages) e o webhook do n8n.
// - Esconde a URL do n8n (fica no segredo N8N_WEBHOOK_URL do Worker).
// - Aceita só POST com JSON vindo do site do formulário.
// - Limita quantos envios cada IP pode fazer por minuto.

const ALLOWED_ORIGIN = "https://apuamacapital.github.io";
const MAX_PER_MINUTE = 5;      // envios por IP a cada 60 segundos
const MAX_BODY_BYTES = 10000;  // o formulário manda bem menos que isso

const hits = new Map(); // ip -> lista de horários (ms) dos últimos envios

function cors(extra = {}) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    ...extra,
  };
}

function reply(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: cors({ "Content-Type": "application/json" }),
  });
}

function tooMany(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // evita crescer sem limite
  return recent.length > MAX_PER_MINUTE;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      if (origin !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: cors() });
    }

    if (request.method !== "POST") return reply(405, { ok: false, error: "method" });
    if (origin !== ALLOWED_ORIGIN) return reply(403, { ok: false, error: "origin" });

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (tooMany(ip)) return reply(429, { ok: false, error: "rate_limit" });

    const type = request.headers.get("Content-Type") || "";
    if (!type.includes("application/json")) return reply(415, { ok: false, error: "type" });

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return reply(413, { ok: false, error: "size" });

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return reply(400, { ok: false, error: "json" });
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return reply(400, { ok: false, error: "json" });
    }

    if (!env.N8N_WEBHOOK_URL) return reply(500, { ok: false, error: "config" });

    const upstream = await fetch(env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!upstream.ok) return reply(502, { ok: false, error: "upstream" });
    return reply(200, { ok: true });
  },
};
