export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // Server-side honeypot check
    const honeypot = formData.get('website');
    if (honeypot && honeypot.trim() !== '') {
      return new Response(JSON.stringify({ error: 'Spam detectado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remove honeypot before forwarding
    formData.delete('website');

    // Validate required fields
    const required = ['nome', 'email', 'telefone', 'servico', 'mensagem', 'lgpd_consent'];
    for (const field of required) {
      const value = formData.get(field);
      if (!value || value.trim() === '') {
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

    // Forward to Formspree (fallback endpoint)
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqkrqkqz';
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Formspree error:', response.status, text);
      return new Response(JSON.stringify({ error: 'Erro ao enviar formulário' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Submit error:', error);
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