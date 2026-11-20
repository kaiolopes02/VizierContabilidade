# Atualização LGPD hCaptcha Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar transparência LGPD do hCaptcha nos três idiomas sem alterar outras cláusulas.

**Architecture:** O texto-base permanece no HTML em português; inglês e espanhol usam chaves existentes em `public/js/i18n.js`. Uma chave `privupdated` separada preserva a data anterior dos Termos de Uso.

**Tech Stack:** HTML, JavaScript sem dependências, testes Node.js, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-11-20-lgpd-hcaptcha-design.md`

## Global Constraints

- Sem novas dependências e sem backend.
- Não alterar `findings.json`.
- Atualizar o cache-busting de `i18n.js` para `v=5` nos 13 HTMLs.
- Não alterar a data dos Termos de Uso.

## Review Focus

- As três traduções devem mencionar o hCaptcha e as mesmas categorias de dados técnicos.
- A Política e os Termos devem exibir datas diferentes após a tradução.
- Nenhum HTML pode continuar servindo `i18n.js?v=4`.

---

### Task 1: Transparência e cache da Política

**Files:**
- Modify: `tests/forms.mjs`
- Modify: `public/pages/politica-de-privacidade.html`
- Modify: `public/js/i18n.js`
- Modify: `public/index.html`
- Modify: `public/404.html`
- Modify: `public/pages/*.html`

**Interfaces:**
- Consumes: chaves `privtext4a`, `legal.updated`; atributo `data-i18n`.
- Produces: chave `privupdated` em `en-US`/`es`; `i18n.js?v=5` em todos os HTMLs.

- [ ] **Step 1: Escrever testes falhos** para hCaptcha nos três idiomas, data da Política, data intacta dos Termos e `i18n.js?v=5`.
- [ ] **Step 2: Executar `node tests/forms.mjs`** e confirmar falha pelas novas expectativas.
- [ ] **Step 3: Atualizar o texto e as traduções** com o conteúdo especificado no design.
- [ ] **Step 4: Atualizar `i18n.js?v=5`** nos 13 HTMLs.
- [ ] **Step 5: Executar `node tests/forms.mjs`** e confirmar todas as verificações verdes.
- [ ] **Step 6: Rodar smoke local** com `wrangler pages dev` e `tests/smoke.ps1`; confirmar 0 falhas.
- [ ] **Step 7: Commitar** com mensagem `docs: atualiza LGPD para o hCaptcha`.
