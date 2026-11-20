# F2 — Barreira server-side no formulário (hCaptcha + Web3Forms)

**Data:** 2026-11-19 · **Branch:** `fix/f2-hcaptcha` · **Base:** `main` @ `babdaef` · **Status:** aguardando aprovação

## Intent

O achado **F2** (LOW, confirmado) do run-4 da auditoria diz que o formulário envia direto do navegador para `https://api.web3forms.com/submit` (`public/js/main.js:632`), então honeypot (`:534`), consentimento LGPD (`:576`) e validação de campos (`:551-585`) existem **apenas no cliente**. Um atacante que não carregue a página lê a chave pública (`public/js/main.js:25`) e faz POST direto: entrega e-mail arbitrário no inbox da Vizier e consome a cota (250/mês no plano grátis).

Comportamento desejado (do próprio achado): *"O formulário deve entregar apenas mensagens de visitantes que passaram pelo honeypot, pelo consentimento LGPD e pela validação de campos, com uma barreira server-side (captcha verificado, rate limit ou Worker) entre o público e o inbox."*

## Goals

- Fechar o F2 com uma barreira **server-side real**, sem reintroduzir backend.
- Preservar o visual, as classes e o comportamento atual do formulário.
- Manter o envio no padrão suportado pelo provedor (POST do navegador).

## Non-goals

- Reintroduzir `functions/` (Worker), rate limit por IP ou chave como secret.
- Turnstile / "Restrict to Domain" (recursos **Pro** do Web3Forms).
- Mover layout, textos ou cores; mexer no F1 (chave StaticForms no cache do edge) — é operacional (purge + rotação).

## Constraints

- Requisito original do projeto: **sem backend**. O plano grátis do Web3Forms tem hCaptcha (server-side); Turnstile e restrição por domínio são Pro.
- O Web3Forms recusa POST server-side ("Use our API in client side"), então relay via Worker é frágil e foi descartado.
- O provedor só avalia a barreira depois de **ativada no painel** `app.web3forms.com` → uma ação manual do usuário, sem a qual o F2 continua aberto.
- `public/_headers` hoje tem `frame-src 'none'` e `script-src` sem hCaptcha.

## Approaches considered

| | Abordagem | Trade-off | Decisão |
|---|---|---|---|
| A | **hCaptcha server-side via Web3Forms** | Mantém "sem backend"; 1 toggle manual do usuário; adiciona script/iframe de terceiro e um checkbox visível | **Escolhida** |
| B | Pages Function server-side | Controle total (honeypot + LGPD + campos + rate limit), chave sai do JS; mas contraria "sem backend" e depende do provedor aceitar relay com `Origin`/`Referer` forjados | Descartada |
| C | Aceitar o risco, documentar + fallback WhatsApp | Zero código; **não corrige F2** (é a "alternativa mínima" do achado) | Descartada |

## Desenho escolhido

**Mecanismo:** hCaptcha no modal. O widget injeta `<textarea name="h-captcha-response">` dentro do `<form>`; o `FormData` já leva o token; o Web3Forms valida o token **no servidor** e rejeita submissões sem token válido. O código do site nunca precisa conhecer o segredo do hCaptcha.

**`public/js/main.js`**

- Novas constantes:
  - `HCAPTCHA_SITEKEY = '50b2fe65-b00b-4b9e-ad62-3ba471098be2'` — sitekey compartilhado do Web3Forms para planos grátis (docs: "Manual Setup").
  - `HCAPTCHA_SCRIPT = 'https://js.hcaptcha.com/1/api.js?render=explicit&onload=vizierHCaptchaReady'`.
- Markup do modal (`create()`, antes do botão de submit): `<div id="hcaptcha-widget" class="h-captcha"></div>` dentro de um `.form-group`, com `span.form-error[data-i18n="modal.captchaErro"]`.
- Script carregado **sob demanda**, na primeira abertura do modal (lazy): um `<script async defer>` injetado uma única vez com `render=explicit&onload=vizierHCaptchaReady`. Antes de anexá-lo, `window.vizierHCaptchaReady` aponta para a função de render; o callback do hCaptcha chama `window.hcaptcha.render(container, { sitekey })` e só guarda o widget id quando o retorno é verdadeiro. O listener `load` é apenas um fallback de 50 ms, condicionado a `hcaptchaWidgetId === null`. `render=explicit` é obrigatório porque o modal é criado dinamicamente (o auto-render não encontraria o container).
- **Gate no cliente** no handler de submit: se `textarea[name="h-captcha-response"]` estiver vazio → marcar o `.form-group` com `.error` e **não** fazer o `fetch` (mesma convenção de validação já existente no arquivo).
- **Reset** do widget (`window.hcaptcha.reset(widgetId)`) no caminho de erro do envio e ao fechar o modal — o token é de uso único e expira.
- Nada de `innerHTML` com dado de usuário; visual/classes existentes intactos.

**`public/_headers`** (CSP) — `script-src`, `frame-src` e `connect-src` passam a permitir `https://hcaptcha.com https://*.hcaptcha.com`. `frame-ancestors 'none'`, `object-src 'none'`, `form-action` e `base-uri` inalterados.

**`public/js/i18n.js`** — novas chaves `modal.captchaErro` (e `modal.captcha` se houver rótulo) nos dicionários `pt-BR`, `en-US` e `es`.

**`tests/forms.mjs`** — Checks estáticos novos (o arquivo já é o lugar dos checks do formulário): sitekey, `render=explicit` e `onload=vizierHCaptchaReady` presentes; callback definido antes do `appendChild`; fallback condicionado ao widget ainda não renderizado; widget no markup; gate do captcha **antes** de `new FormData(form)`; `window.hcaptcha.reset` no caminho de erro; CSP com as origens do hCaptcha nas 3 diretivas; chave de i18n nos 3 idiomas.

**`README.md`** — 1-2 linhas: o formulário depende do modo hCaptcha do Web3Forms e do passo de ativação no painel.

## Passo operacional (depende do usuário)

`app.web3forms.com` → seu formulário → **Settings → Block Spam → hCaptcha → Save**. Sem isso o provedor aceita POST direto e o F2 continua aberto.

## Verificação

1. `node --check public/js/main.js` e `public/js/i18n.js`.
2. `node tests/forms.mjs` — todos verdes (a contagem cresce a partir de 76).
3. `wrangler pages dev` + `tests/smoke.ps1`: páginas 200, CSP com hCaptcha, `/js/main.js` e `/js/i18n.js` 200.
4. **Prova dinâmica do F2**: POST direto ao Web3Forms **sem** `h-captcha-response` → o provedor deve **rejeitar**. (Hoje, sem o toggle do painel, ele aceita — o teste documenta o estado.)
5. Manual, no navegador (usuário): abrir o modal → resolver o captcha → enviar → e-mail chega em `contato@viziercontabilidade.com.br`; e com o token vazio → nenhum request sai.

## Riscos e pendências residuais

- **F2 só fecha depois do toggle no painel.** Até lá o código é inerte contra POST direto.
- hCaptcha é terceiro: script + iframe + `connect-src` alargado, e pode tratar dados do visitante — registrar na Política de Privacidade (decisão do usuário; não entra neste patch).
- UX: checkbox visível no modal (mitigação possível: `size: 'flexible'`).
- Se o Web3Forms recusar o sitekey compartilhado nesta conta, o fallback é o script proxy do provedor (`web3forms.com/client/script.js`) ou o plano Pro com Turnstile.
- F1 segue aberto (chave `sf_06193…` em 5 URLs no cache do edge) — purge + rotação, fora deste patch.
