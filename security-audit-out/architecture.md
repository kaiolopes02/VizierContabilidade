 # Architecture Report — Vizier Contabilidade
 
 ## Overview
 Static marketing site for an accounting firm (Vizier Contabilidade), deployed on Cloudflare Pages. Single form (orçamento/contact) submits via a Cloudflare Worker proxy to StaticForms (api.staticforms.xyz) for email delivery. No authentication, no user accounts, no database. ~29 files total.
 
 ## Technology Stack
 - **Hosting**: Cloudflare Pages (wrangler.jsonc, compatibility_date 2026-07-02)
 - **Backend**: Cloudflare Worker at `functions/api/submit.js` — handles POST /api/submit, OPTIONS for CORS preflight
 - **External Service**: api.staticforms.xyz (form-to-email SaaS) — accessKey `sf_06193e9224b406b37979ed81`
 - **Frontend**: Vanilla HTML/CSS/JS, no frameworks. JS is IIFE with `defer`.
 - **Fonts**: Google Fonts (Inter)
 - **Analytics**: None configured (no GA/GTM scripts found, though CSP allows google.com/gstatic.com)
 
 ## Trust Boundaries
 
 ```
 [Browser] --POST--> [Cloudflare Worker] --POST--> [StaticForms API] --> [Email inbox]
                    /api/submit              api.staticforms.xyz/submit
 
 [Browser] --GET--> [Cloudflare Pages CDN] --> static assets
 ```
 
 - **Boundary 1**: Browser → Worker. Same-origin. Worker validates required fields + honeypot + LGPD consent.
 - **Boundary 2**: Worker → StaticForms. The Worker is a pass-through proxy. It adds `subject` field, removes honeypot, maps `whatsapp→telefone`. Does NOT validate the accessKey against any server-side secret.
 - **Boundary 3**: StaticForms → Email. Trusted third party. accessKey embedded in HTML form (hidden input).
 
 ## Input Surfaces
 
 | Surface | Method | Auth | Notes |
 |---------|--------|------|-------|
 | POST /api/submit | FormData multipart | None | Worker validates: nome, email, telefone/whatsapp, servico, lgpd_consent |
 | OPTIONS /api/submit | Preflight | None | Returns CORS *, allows POST+OPTIONS |
 | Static HTML pages | GET | None | 12 HTML pages, all static |
 
 ## Security Controls Present
 
 - **CSP** (_headers file): default-src 'self', frame-ancestors 'none', form-action restricted
 - **HSTS**: max-age=15768000; includeSubDomains; preload
 - **X-Frame-Options**: DENY
 - **X-Content-Type-Options**: nosniff
 - **Referrer-Policy**: strict-origin-when-cross-origin
 - **Permissions-Policy**: restrictive (all sensors disabled)
 - **Honeypot**: client-side + server-side check on `website` field
 - **LGPD consent**: required checkbox before submission
 - **Client-side validation**: email regex, phone format, required fields, minlength
 - **Server-side validation**: required fields, LGPD consent value check
 - **security.txt**: RFC 9116 compliant at /.well-known/security.txt
 - **Cache headers**: 1h for JS, 24h for CSS
 
 ## Prior Runs
 None. This is run-1.
