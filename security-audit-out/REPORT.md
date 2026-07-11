 # Security Audit Report — Vizier Contabilidade
 
 **Run:** run-1 | **Date:** 2026-07-11 | **Auditor:** Codex (Loopy + Security Audit)
 **Coverage:** ~29 files, static site + Cloudflare Worker
 
 ---
 
 ## Executive Summary
 
 Auditou-se um site estático de contabilidade (Cloudflare Pages + Worker) com um formulário de contato que encaminha dados para StaticForms (SaaS de form-to-email). O site tem bons controles de segurança de base (CSP, HSTS, frame-ancestors, honeypot), mas **3 vulnerabilidades confirmadas** exigem correção.
 
 **Severidade máxima: MEDIUM.** Nenhuma vulnerabilidade CRITICAL ou HIGH encontrada. O site não tem autenticação, banco de dados, ou área logada — o que limita o impacto de qualquer ataque a spam/abuso de formulário e vazamento de PII em logs.
 
 ---
 
 ## Findings
 
 ### 1. [MEDIUM] accessKey do StaticForms exposto no client-side → bypass total do Worker
 
 **Local:** `js/main.js:283` (hidden input no HTML do modal)
 
 **Descrição:** A chave de API do StaticForms (`sf_06193e9224b406b37979ed81`) está hardcoded como `<input type="hidden">` no formulário renderizado pelo JS. Qualquer visitante pode extraí-la do source. Confirmado dinamicamente: um POST direto para `api.staticforms.xyz/submit` com essa chave retornou HTTP 200 `{"success":true}`, ignorando completamente:
 - Validação de campos obrigatórios do Worker
 - Verificação de honeypot
 - Validação de consentimento LGPD
 
 **Impacto:** Atacante pode enviar formulários ilimitados diretamente ao StaticForms, poluindo o inbox de contato da Vizier com spam, phishing interno, ou mensagens maliciosas. Nenhum dado de cliente é exposto, mas a integridade do canal de contato é comprometida.
 
 **Correção:** Mover o accessKey para variável de ambiente do Cloudflare Worker (`wrangler.jsonc` → `vars`) e injetá-lo server-side no Worker, nunca expondo ao cliente. Ver correção aplicada em `functions/api/submit.js` e `js/main.js`.
 
 ---
 
 ### 2. [MEDIUM] Vazamento de PII em console.log do Worker (LGPD)
 
 **Local:** `functions/api/submit.js:80`
 
 **Descrição:** O Worker registra em console `[Worker] Forwarding fields:` seguido de todos os campos do formulário (nome, email, telefone, CNPJ, mensagem). Estes logs são acessíveis via `wrangler tail` e no dashboard da Cloudflare. Constitui armazenamento de dados pessoais em logs sem consentimento explícito para esta finalidade — violação potencial do art. 6º da LGPD (falta de base legal para tratamento).
 
 **Código ofensivo:**
 ```js
 console.log('[Worker] Forwarding fields:', [...formData.entries()].map(([k,v]) => `${k}=${v?.slice?.(0,20) || v}`).join(', '));
 ```
 
 **Impacto:** Quem tem acesso ao dashboard Cloudflare (equipe técnica, e potencialmente Cloudflare Inc.) pode visualizar PII de clientes. Risco regulatório (LGPD) e de confiança.
 
 **Correção:** Remover o console.log que imprime dados de formulário, ou sanitizá-lo para imprimir apenas metadados (ex: contagem de campos, nomes de campos, sem valores).
 
 ---
 
 ### 3. [LOW] Sem rate limiting no Worker — suscetível a abuso de formulário
 
 **Local:** `functions/api/submit.js` (ausência de controle)
 
 **Descrição:** O Worker não implementa nenhuma limitação de taxa. Um atacante pode disparar centenas de POSTs em sequência, gerando spam no inbox e consumo de recursos do Worker (CPU/GB-sec na quota da Cloudflare).
 
 **Impacto:** DoS leve via esgotamento de quota gratuita do Cloudflare Workers (100k req/dia no plano free) e spam no email. Cloudflare tem DDoS protection na borda, mas isso não cobre abuse de endpoint específico em baixo volume.
 
 **Correção:** Rate limiting simples por IP usando `crypto.subtle.digest` (sem KV) — ver correção aplicada em `functions/api/submit.js`.
 
 ---
 
 ## Hardening Notes (não-vulnerabilidades)
 
 ### HN-1: CSP permite fontes externas desnecessárias
 - `script-src` inclui `www.google.com`, `www.gstatic.com` mas nenhum script destas origens é carregado. Remover ou justificar (ex: reCAPTCHA futuro).
 - `connect-src` e `form-action` incluem `formspree.io` mas o serviço usado é StaticForms.
 
 ### HN-2: `unsafe-inline` no CSP de scripts
 - Necessário para os scripts inline legítimos (schema.org JSON-LD, guardião mobile). Sem user-generated content, XSS não é explorável atualmente. Se o site evoluir para incluir UGC, remover `unsafe-inline` e usar nonces/hashes.
 
 ### HN-3: CORS preflight inconsistente
 - OPTIONS retorna `Access-Control-Allow-Origin: *` mas POST não define CORS headers. Cross-origin JS não lê a resposta, mas o POST executa server-side. Baixo risco dado que não há autenticação.
 
 ---
 
 ## O Que o Site Faz Bem
 
 - **CSP robusto** (frame-ancestors 'none', base-uri 'self', upgrade-insecure-requests)
 - **HSTS preload** com max-age de 6 meses
 - **Honeypot** client-side + server-side (efetivo contra bots básicos)
 - **LGPD consent** obrigatório no form
 - **Validação server-side** de campos obrigatórios
 - **Headers de cache** para JS/CSS
 - **security.txt** RFC 9116
 - **Sem dependências npm**, sem frameworks — superfície de ataque mínima
 - **Sem eval(), innerHTML com user input, ou DOM XSS sinks**
 
 ---
 
 ## Recomendações Pós-Correção
 
 1. Executar run-2 deste audit após as correções para verificar cobertura residual
 2. Se adicionar reCAPTCHA ou analytics, ajustar CSP correspondentemente
 3. Considerar logging estruturado sem PII (contagem de campos, timestamps, status codes)
 4. Monitorar quota do Cloudflare Workers para detectar abuse patterns
