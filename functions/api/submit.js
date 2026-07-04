// ponytail: Cloudflare Pages Function — só executa na Cloudflare ou `wrangler pages dev`.
// Em local dev (Live Server / localhost), este Worker NÃO está rodando; o frontend
// (main.js) detecta o ambiente e pula direto para api.staticforms.xyz/submit.
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();
    // DEBUG: Cloudflare Workers console.log visivel em `wrangler tail`
    // console.log('[Worker] Dados recebidos:', [...formData.entries()].map(([k,v]) => `${k}=${v}`).join(', '));

    // Server-side honeypot check
    const honeypot = formData.get('website');
    if (honeypot && honeypot.trim() !== '') {
      // console.log('[Worker] Honeypot preenchido - spam bloqueado');
      return new Response(JSON.stringify({ error: 'Spam detectado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove honeypot before forwarding
    formData.delete('website');

    // FIX MOBILE/COMPAT: o front envia o telefone como "whatsapp", mas a validacao
    // abaixo exigia "telefone". Sem este alias o Worker rejeitava todos os envios com
    // 400 ("Campo obrigatorio: telefone"), forcando o fallback no frontend.
    // FIX 2026-07-02: Mapear primeiro, depois remover "whatsapp" para evitar que o
    // StaticForms receba dois campos duplicados (whatsapp + telefone) com mesmo valor.
    const telefone = formData.get('telefone') || formData.get('whatsapp');
    if (telefone) {
      formData.set('telefone', telefone);
      formData.delete('whatsapp');
    }

    // Validate required fields
    // FIX MOBILE/COMPAT: "mensagem" e opcional no front (textarea sem required), entao
    // nao deve ser obrigatorio aqui. Antes o Worker rejeitava envios validos por causa disso.
    const required = ['nome', 'email', 'telefone', 'servico', 'lgpd_consent'];
    for (const field of required) {
      const value = formData.get(field);
      if (!value || value.trim() === '') {
        // console.log('[Worker] Validacao falhou, campo ausente:', field);
        return new Response(JSON.stringify({ error: `Campo obrigatório: ${field}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Validate LGPD consent
    const lgpd = formData.get('lgpd_consent');
    if (lgpd !== 'true' && lgpd !== 'on' && lgpd !== true) {
      return new Response(JSON.stringify({ error: 'Consentimento LGPD é obrigatório' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // StaticForms: customiza o subject do email de notificacao para facilitar a
    // triagem no inbox. Formato: "{assunto} — {nome}".
    // - assunto vazio/ausente -> fallback "Contato via site Vizier"
    // - nome vazio/ausente     -> so o assunto (sem separador)
    // set() sobrescreve qualquer subject existente.
    const assuntoSubject = (formData.get('assunto') || '').trim() || 'Contato via site Vizier';
    const nomeSubject = (formData.get('nome') || '').trim();
    formData.set('subject', nomeSubject ? `${assuntoSubject} — ${nomeSubject}` : assuntoSubject);

    // Forward to StaticForms - must match main.js STATIC_FORMS_FALLBACK
    const FORMSPREE_ENDPOINT = 'https://api.staticforms.xyz/submit';
    // No runtime do Cloudflare Workers, o Content-Type multipart/form-data
    // com boundary e gerado automaticamente ao passar FormData como body.
   // Nao definimos Content-Type manualmente para preservar o boundary.
   // console.log('[Worker] Encaminhando para StaticForms...');
    console.log('[Worker] Forwarding fields:', [...formData.entries()].map(([k,v]) => `${k}=${v?.slice?.(0,20) || v}`).join(', '));
   const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[Worker] StaticForms error:', response.status, text);
      return new Response(JSON.stringify({ error: 'Erro ao enviar formulário' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // console.log('[Worker] StaticForms respondeu OK, email enviado.');
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Worker] Erro interno:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
