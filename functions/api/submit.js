// ponytail: Cloudflare Pages Function — só executa na Cloudflare ou `wrangler pages dev`.
// Em local dev (Live Server / localhost), este Worker NÃO está rodando; o frontend
// (main.js) detecta o ambiente e pula direto para api.staticforms.xyz/submit.

// ponytail: rate limiter simples por IP usando Map (sem KV). Zera quando o Worker
// cold-starta (~minutos). Suficiente para abuse básico; upgrade para Cloudflare
// Rate Limiting Rules se escala.
const RATE_LIMITS = new Map(); // IP -> {count, resetAt}

// ponytail: limpeza preguiçosa do rate limit map — remove entradas expiradas a cada request.
// Substitui setInterval no escopo global (proibido no Workers runtime: "Disallowed
// operation called within global scope"). O Map não é compartilhado entre instâncias;
// cold-start zera naturalmente.
function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, entry] of RATE_LIMITS) {
    if (now >= entry.resetAt) RATE_LIMITS.delete(ip);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Lazy cleanup: remove entradas expiradas a cada request
  cleanupRateLimits();

  try {
    const formData = await request.formData();

    // Rate limiting: 10 requests per 60s per IP
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const now = Date.now();
    const entry = RATE_LIMITS.get(ip);
    if (entry && now < entry.resetAt && entry.count >= 10) {
      return new Response(JSON.stringify({ error: "Muitas solicitações. Aguarde um momento." }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!entry || now >= entry.resetAt) {
      RATE_LIMITS.set(ip, { count: 1, resetAt: now + 60000 });
    } else {
      entry.count++;
    }

    // Server-side honeypot check
    const honeypot = formData.get("website");
    if (honeypot && honeypot.trim() !== "") {
      return new Response(JSON.stringify({ error: "Spam detectado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Remove honeypot before forwarding
    formData.delete("website");

    // FIX MOBILE/COMPAT: mapeia whatsapp -> telefone
    const telefone = formData.get("telefone") || formData.get("whatsapp");
    if (telefone) {
      formData.set("telefone", telefone);
      formData.delete("whatsapp");
    }

    // Validate required fields
    const required = ["nome", "email", "telefone", "servico", "lgpd_consent"];
    for (const field of required) {
      const value = formData.get(field);
      if (!value || value.trim() === "") {
        return new Response(JSON.stringify({ error: `Campo obrigatório: ${field}` }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // Validate LGPD consent
    const lgpd = formData.get("lgpd_consent");
    if (lgpd !== "true" && lgpd !== "on" && lgpd !== true) {
      return new Response(JSON.stringify({ error: "Consentimento LGPD é obrigatório" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Customiza subject do email
    const assuntoSubject = (formData.get("assunto") || "").trim() || "Contato via site Vizier";
    const nomeSubject = (formData.get("nome") || "").trim();
    formData.set("subject", nomeSubject ? `${assuntoSubject} — ${nomeSubject}` : assuntoSubject);

    // Forward to StaticForms
    const FORMSPREE_ENDPOINT = "https://api.staticforms.xyz/submit";

    // FIX SECURITY: accessKey vem de variável de ambiente do Worker,
    // nunca exposta no client-side. Ver wrangler.jsonc -> vars.STATICFORMS_ACCESS_KEY.
    // FIX EMAIL: hard fail se env var nao configurada — antes o Worker encaminhava
    // sem accessKey e o StaticForms rejeitava silenciosamente (email nunca chegava).
    const accessKey = env.STATICFORMS_ACCESS_KEY;
    if (!accessKey) {
      console.error("[Worker] STATICFORMS_ACCESS_KEY env var nao configurada");
      return new Response(JSON.stringify({ error: "Configuração do servidor incompleta" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    formData.set("accessKey", accessKey);

    // FIX SECURITY: removido log de PII. Apenas metadados.
    console.log("[Worker] Forwarding to StaticForms, field count:", [...formData.entries()].length);

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[Worker] StaticForms error:", response.status, text.substring(0, 100));
      return new Response(JSON.stringify({ error: "Erro ao enviar formulário" }), {
        status: 502,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[Worker] Erro interno:", error.message);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}
