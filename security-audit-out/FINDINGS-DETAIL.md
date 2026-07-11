 # Findings Detail — Vizier Contabilidade (run-1)
 
 ## Finding 1: accessKey do StaticForms exposto (MEDIUM)
 
 ### Data Flow
 ```
 User opens site
   → main.js IIFE initModal() renderiza <form> com <input type="hidden" name="accessKey" value="sf_...">
   → Usuário/atacante inspeciona DOM (DevTools) ou source do JS
   → Extrai accessKey
   → POST direto a https://api.staticforms.xyz/submit com accessKey + campos arbitrários
   → Bypassa /api/submit (Worker) → sem honeypot, sem validação LGPD, sem rate limit
   → Email chega ao inbox da Vizier
 ```
 
 ### Confirmation
 POST manual para `api.staticforms.xyz/submit` com:
 - accessKey: `sf_06193e9224b406b37979ed81`
 - nome, email, telefone, servico, subject, mensagem arbitrários
 
 Resposta: HTTP 200 `{"success":true,"message":"Form submitted successfully"}`
 
 ### Fix Applied
 1. `js/main.js`: removido `<input type="hidden" name="accessKey">` do form renderizado
 2. `wrangler.jsonc`: adicionado `vars.STATICFORMS_ACCESS_KEY`
 3. `functions/api/submit.js`: Worker lê `env.STATICFORMS_ACCESS_KEY` e injeta no FormData antes do forward
 
 ---
 
 ## Finding 2: Vazamento de PII em console.log (MEDIUM)
 
 ### Data Flow
 ```
 POST /api/submit (FormData com nome, email, telefone, CNPJ, mensagem)
   → Worker: console.log('[Worker] Forwarding fields:', ...entries com valores)
   → wrangler tail / Cloudflare dashboard → logs persistem
   → Operador com acesso ao dashboard lê PII
 ```
 
 ### Fix Applied
 `functions/api/submit.js`: trocado `console.log` de valores por `field count`:
 ```js
 console.log("[Worker] Forwarding to StaticForms, field count:", [...formData.entries()].length);
 ```
 E o error path agora trunca: `text.substring(0, 100)`.
 
 ---
 
 ## Finding 3: Sem rate limiting (LOW)
 
 ### Data Flow
 ```
 Atacante → script loop POST /api/submit
   → Worker processa cada request (validação + fetch ao StaticForms)
   → Consome CPU/GB-sec do Cloudflare Workers
   → Esgota quota free (100k req/dia) → DoS de plano
   → Spam no inbox da Vizier
 ```
 
 ### Fix Applied
 `functions/api/submit.js`: rate limiter Map por IP (CF-Connecting-IP):
 - 10 requests / 60s por IP
 - HTTP 429 com JSON ao exceder
 - Cleanup periódico via setInterval (2min)
 - Ceiling: `# ponytail: global lock, per-account locks if throughput matters`
