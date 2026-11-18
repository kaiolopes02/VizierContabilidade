# Vizier Contabilidade

Site institucional da Vizier Contabilidade Empresarial — contabilidade digital para
MEI, pequenas e médias empresas.

## Funcionalidades

- **Páginas de serviços:** abertura de empresa, contabilidade mensal, folha de
  pagamento, declarações fiscais, planejamento tributário, consultoria contábil e
  troca de contador.
- **Planos:** comparativo de recursos entre as modalidades oferecidas.
- **FAQ:** perguntas frequentes em acordeão, navegável por teclado.
- **Formulário de contato/orçamento:** validação no navegador, consentimento LGPD,
  honeypot e envio direto para o Web3Forms.
- **Conteúdo legal:** política de privacidade e termos de uso.
- **Três idiomas:** português (padrão), inglês e espanhol, com a escolha
  preservada entre visitas.
- **Acessibilidade e responsividade:** navegação por teclado, contraste adequado,
  textos alternativos e layout adaptado a telas pequenas.

## Estrutura

```
public/         site publicado (HTML, CSS, JS, imagens, headers)
tests/          testes estáticos do formulário e de fumaça do site
wrangler.jsonc  configuração do projeto no Cloudflare Pages
```

## Desenvolvimento local

```powershell
npx --yes wrangler@4 pages dev --port 8788 --ip 127.0.0.1
```

O servidor fica em `http://127.0.0.1:8788`. O formulário envia direto para
`https://api.web3forms.com/submit` pelo navegador; não há função de servidor nem
secret no projeto. A access key do Web3Forms é pública por design.

## Testes

Verificações estáticas (markup, handler, CSP e resíduos), sem servidor:

```powershell
node tests/forms.mjs
```

Com o servidor acima rodando, em outro terminal:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/smoke.ps1
```

## Deploy

Publicado no Cloudflare Pages a partir da branch `main`. O diretório de saída é
`public/`, definido no `wrangler.jsonc`.
