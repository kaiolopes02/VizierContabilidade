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
    // Formspree receba dois campos duplicados (whatsapp + telefone) com mesmo valor.
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

    // FIX MOBILE (2026-07-02): Remover campos internos antes de encaminhar ao Formspree.
    // accessKey, subject, g-recaptcha-response sao apenas para o fluxo interno; o
    // Formspree nao precisa deles (a chave do Formspree e hardcoded no endpoint).
    formData.delete('accessKey');
    formData.delete('g-recaptcha-response');

    // Forward to Formspree (fallback endpoint)
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqkrkqz';
    // FIX MOBILE (2026-07-02): No runtime do Cloudflare Workers, o Content-Type
    // multipart/form-data com boundary e gerado automaticamente ao passar FormData
    // como body. Nao definimos Content-Type manualmente para nao sobrescrever o
    // boundary gerado automaticamente. O Formspree espera exatamente este formato.
    // console.log('[Worker] Encaminhando para Formspree...');
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[Worker] Formspree error:', response.status, text);
      return new Response(JSON.stringify({ error: 'Erro ao enviar formulário' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // console.log('[Worker] Formspree respondeu OK, email enviado.');
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