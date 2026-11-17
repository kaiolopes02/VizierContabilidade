// Cloudflare Pages Function — só executa na Cloudflare ou em `wrangler pages dev`.
// O frontend (public/js/main.js) usa sempre /api/submit; a accessKey fica só aqui (secret).

const STATICFORMS_ENDPOINT = "https://api.staticforms.xyz/submit";
const ALLOWED_ORIGINS = new Set([
  "https://www.viziercontabilidade.com.br",
  "https://viziercontabilidade.com.br"
]);

const MAX_BYTES = 20_000;
const MAX_FIELD = {
  nome: 120, email: 254, telefone: 20, tipo_empresa: 40, servico: 80,
  mensagem: 4000, cnpj: 20, contador_atual: 120, assunto: 160
};
const REQUIRED = ["nome", "email", "telefone", "tipo_empresa", "servico", "lgpd_consent"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
});

// Rate limit por isolate (Map não é compartilhado entre instâncias).
// shortcut: 10 req/min por isolate, sem KV — suficiente para abuso básico.
// Em escala, configure WAF > Rate limiting rules em POST /api/submit.
const MAX_IPS = 5000;
const RATE_LIMITS = new Map(); // IP -> {count, resetAt}

function rateOk(ip) {
  const now = Date.now();
  const entry = RATE_LIMITS.get(ip);
  if (!entry || now >= entry.resetAt) {
    if (RATE_LIMITS.size >= MAX_IPS) RATE_LIMITS.clear(); // teto duro: sem varredura O(n)
    RATE_LIMITS.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  return ++entry.count <= 10;
}

export async function onRequestPost({ request, env }) {
  // Origin obrigatorio: sem ele (curl, bots) a allowlist nao se aplica e o
  // Worker viraria relay aberto do StaticForms (achado F1 do fuzz). Aceita
  // a allowlist ou a propria origem da requisicao (dev local, onde o
  // navegador sempre manda Origin no POST).
  const origin = request.headers.get("Origin");
  const allowed =
    origin &&
    (ALLOWED_ORIGINS.has(origin) || origin === new URL(request.url).origin);
  if (!allowed) return json({ error: "Origem não permitida" }, 403);

  // Limites antes de tocar no corpo: evita parsear multipart grande em memória.
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!rateOk(ip)) return json({ error: "Muitas solicitações. Aguarde um momento." }, 429);
  if (Number(request.headers.get("Content-Length") || 0) > MAX_BYTES) {
    return json({ error: "Requisição muito grande" }, 413);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Formato inválido" }, 400);
  }

  // Honeypot: resposta genérica para não revelar a detecção.
  if (String(form.get("website") || "").trim() !== "") {
    return json({ error: "Spam detectado" }, 400);
  }
  form.delete("website");

  // Compat: o front envia o telefone como "whatsapp" no modal.
  const telefone = form.get("telefone") || form.get("whatsapp");
  if (telefone) {
    form.set("telefone", telefone);
    form.delete("whatsapp");
  }

  for (const field of REQUIRED) {
    const value = form.get(field);
    if (typeof value !== "string" || !value.trim()) {
      return json({ error: `Campo obrigatório: ${field}` }, 400);
    }
  }

  if (!EMAIL.test(String(form.get("email")).trim())) return json({ error: "E-mail inválido" }, 400);

  const digits = String(form.get("telefone")).replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) return json({ error: "Telefone inválido" }, 400);

  if (!["true", "on"].includes(String(form.get("lgpd_consent")))) {
    return json({ error: "Consentimento LGPD é obrigatório" }, 400);
  }

  for (const [field, max] of Object.entries(MAX_FIELD)) {
    const value = form.get(field);
    if (value != null && String(value).length > max) {
      return json({ error: `Campo inválido: ${field}` }, 400);
    }
  }

  // Subject em uma linha: descarta CRLF (header injection) e limita tamanho.
  const oneLine = (value) => String(value || "").replace(/[\r\n]+/g, " ").trim().slice(0, 160);
  const subject = oneLine(form.get("assunto")) || oneLine(form.get("servico")) || "Contato via site Vizier";
  form.set("subject", `${subject} — ${oneLine(form.get("nome"))}`);

  const accessKey = env.STATICFORMS_ACCESS_KEY;
  if (!accessKey) {
    console.error("[Worker] STATICFORMS_ACCESS_KEY não configurada");
    return json({ error: "Configuração do servidor incompleta" }, 500);
  }
  form.set("accessKey", accessKey);

  console.log("[Worker] Forwarding to StaticForms, field count:", [...form.keys()].length);

  let response;
  try {
    response = await fetch(STATICFORMS_ENDPOINT, {
      method: "POST",
      body: form,
      headers: { "Accept": "application/json" }
    });
  } catch (error) {
    console.error("[Worker] Falha de rede ao StaticForms:", error.message);
    return json({ error: "Erro ao enviar formulário" }, 502);
  }

  if (!response.ok) {
    const text = await response.text();
    console.error("[Worker] StaticForms error:", response.status, text.slice(0, 100));
    return json({ error: "Erro ao enviar formulário" }, 502);
  }

  return json({ success: true });
}

export async function onRequestGet() {
  return json({ error: "Método não permitido" }, 405);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: { "Allow": "POST, OPTIONS", "Access-Control-Allow-Methods": "POST, OPTIONS" }
  });
}
