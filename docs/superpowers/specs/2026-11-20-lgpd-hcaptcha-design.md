# Atualização LGPD — hCaptcha

**Data:** 2026-11-20

## Objetivo

Atualizar a Política de Privacidade para informar o uso do hCaptcha como terceiro que trata dados técnicos dos visitantes no formulário, nos idiomas pt-BR, en-US e es.

## Escopo

- Acrescentar hCaptcha ao parágrafo de compartilhamento de operadores em `public/pages/politica-de-privacidade.html` e nas traduções `privtext4a` de `en-US` e `es`.
- Informar as categorias técnicas tratadas pelo hCaptcha: endereço IP, dados do navegador/dispositivo e interações com o desafio de segurança.
- Atualizar a data da Política para 20 de novembro de 2026 usando chave própria (`privupdated`), sem alterar a data dos Termos de Uso.
- Incrementar `i18n.js?v=4` para `i18n.js?v=5` nos 13 HTMLs.

## Abordagem escolhida

A policy existente já identifica Web3Forms e Cloudflare como terceiros. A alteração mínima é estender o mesmo parágrafo com hCaptcha e seus dados técnicos, preservando estrutura, layout e as demais cláusulas LGPD.

## Fora do escopo

- Não reescrever toda a Política nem criar nova seção jurídica.
- Não alterar `findings.json`; o schema aceita somente `confirmed`/`rejected`.
- Não legalizar outras pendências LGPD apontadas na auditoria (encarregado, base legal por finalidade e prazos específicos do provedor).

## Critérios de aceite

- hCaptcha aparece no texto-base em português e nas traduções em inglês e espanhol.
- As três versões mencionam IP, dados do navegador/dispositivo e interações com o desafio de segurança.
- A Política informa atualização em 20 de novembro de 2026; os Termos continuam em 26 de maio de 2026.
- Todos os 13 HTMLs referenciam `i18n.js?v=5`.
- A suíte `tests/forms.mjs` e o smoke local passam sem falhas.
