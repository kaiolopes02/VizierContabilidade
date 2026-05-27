# VIZIER CONTABILIDADE - SITE INSTITUCIONAL
## Especificação Técnica de Entrega

---

## 📁 Estrutura de Arquivos

```
/output/
├── index.html                          # Home One-Page (Página principal)
├── css/
│   └── main.css                        # Design System + Todas as Seções (29KB)
├── js/
│   └── main.js                         # Módulos ES6: Nav, Scroll, Accordion, 
│                                       # Modal, Form, Analytics, Counters,
│                                       # Impostometro, LazyLoad, Components, LGPD (29KB)
└── pages/
    ├── abertura-de-empresa.html        # Landing Page - Abertura de Empresa
    ├── contabilidade-mensal.html       # Landing Page - Contabilidade Mensal
    ├── folha-de-pagamento.html         # Landing Page - Folha de Pagamento
    ├── declaracoes-fiscais.html        # Landing Page - Declarações Fiscais
    ├── planejamento-tributario.html    # Landing Page - Planejamento Tributário
    ├── consultoria-contabil.html       # Landing Page - Consultoria Contábil
    ├── faq.html                        # Página FAQ com Schema.org
    ├── troque-de-contador.html         # Página Troca de Contador + Formulário
    ├── planos.html                     # Página Planos BPO Financeiro
    ├── politica-de-privacidade.html    # Política LGPD Completa
    ├── termos-de-uso.html              # Termos de Uso
    └── dashboard/
        └── index.html                  # Área do Cliente (Dashboard)
```

---

## 🛠 Stack Tecnológica

| Camada      | Tecnologia              | Justificativa                                    |
|-------------|------------------------|--------------------------------------------------|
| Estrutura   | HTML5 Semântico        | SEO-friendly, acessibilidade nativa              |
| Estilo      | CSS3 (Vanilla)         | Grid/Flexbox nativo, variáveis CSS, @keyframes   |
| Interação   | JavaScript ES6+        | DOM nativo, fetch API, ES6 modules               |
| Dados       | JSON                   | Armazenamento e troca de dados                   |
| Fonte       | Inter (Google Fonts)   | Tipografia moderna, font-display: swap           |

**Sem frameworks** (React, Vue, Angular) - Stack pura para máxima performance.

---

## 🎨 Design System

### Paleta de Cores
| Função         | Cor       | Uso                              |
|----------------|-----------|----------------------------------|
| Primária       | #1e40af   | Confiança, seriedade contábil    |
| Secundária     | #10b981   | CTAs, sucesso, WhatsApp          |
| Destaque       | #f59e0b   | Badge "Mais procurado", alertas  |
| Neutro Claro   | #f8fafc   | Fundos de seção alternados       |
| Neutro Escuro  | #1e293b   | Texto principal                  |

### Breakpoints (Mobile-First)
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

---

## ✅ Funcionalidades Implementadas

### Página Principal (index.html)
- [x] Hero com headline, subheadline e 3 CTAs
- [x] Serviços Destacados (3 cards: Contabilidade, BPO, Holding)
- [x] Sobre / Manifesto com foto placeholder e badges
- [x] Processo de Onboarding (3 passos com animação)
- [x] Grid de Serviços (6 cards com destaque Planejamento Tributário)
- [x] Diferenciais (4 ícones: Resposta rápida, Contador dedicado, 100% digital, Sem multa)
- [x] Planos de Preços (Starter, Pro, Personal) - **SEM VALORES**
- [x] Números / Social Proof (contadores animados)
- [x] Impostômetro (contador animado em tempo real)
- [x] App Mobile (cross-selling com badges download)
- [x] Prova Social (depoimentos reais da Vizier)
- [x] FAQ (6+ perguntas com accordion + Schema.org)
- [x] Manifesto Final
- [x] Footer completo com links legais

### Landing Pages de Serviço (6 páginas)
- [x] Abertura de Empresa
- [x] Contabilidade Mensal
- [x] Folha de Pagamento
- [x] Declarações Fiscais
- [x] Planejamento Tributário (badge "Mais procurado")
- [x] Consultoria Contábil

### Páginas Institucionais
- [x] FAQ completo com Schema.org FAQPage
- [x] Troque de Contador (formulário dedicado)
- [x] Planos (tabela comparativa)
- [x] Política de Privacidade (LGPD)
- [x] Termos de Uso

### Dashboard do Cliente
- [x] Cards resumo (saldo, receitas, despesas, pendências)
- [x] Navegação lateral
- [x] Módulos: Financeiro, Documentos, Notas Fiscais, Suporte, Agendamento

---

## 🔒 Segurança & LGPD

- [x] Banner de cookies com opção de recusar
- [x] Política de Privacidade completa (Lei 13.709/2018)
- [x] Termos de Uso
- [x] Honeypot fields em todos os formulários (anti-spam)
- [x] Validação de inputs via regex
- [x] Links externos com rel="noopener"
- [x] Sem armazenamento de dados sensíveis no localStorage
- [x] Schema.org LocalBusiness para SEO
- [x] Meta tags Open Graph e Twitter Card

---

## ♿ Acessibilidade (WCAG 2.1 AA)

- [x] Skip-to-content link
- [x] Navegação por teclado (tabindex, :focus-visible)
- [x] Alt text em imagens
- [x] ARIA labels em botões, accordions e modal
- [x] Contraste mínimo 4.5:1
- [x] Touch-friendly (botões mínimo 44x44px)
- [x] prefers-reduced-motion respeitado

---

## 📱 Responsividade

- [x] Mobile-first approach
- [x] CSS Grid com auto-fit + minmax()
- [x] Font sizes fluidas com clamp()
- [x] Container responsivo (padding 16px → 48px)
- [x] Menu hambúrguer com animação
- [x] Cards sem quebra em qualquer breakpoint
- [x] Tabela comparativa com scroll horizontal

---

## 🎬 Animações

- [x] IntersectionObserver para fade-in/slide-up ao scrollar
- [x] Hover effects em cards (elevação + sombra)
- [x] Contadores animados com requestAnimationFrame
- [x] Impostômetro com incremento em tempo real
- [x] Accordion com max-height transition
- [x] Modal com transform scale/translate
- [x] Badge "Mais procurado" com pulse CSS
- [x] prefers-reduced-motion para acessibilidade

---

## 📊 Performance

- [x] HTML semântico inline
- [x] CSS crítico em arquivo único
- [x] JS defer para não bloquear render
- [x] Google Fonts com display=swap
- [x] SVG inline para ícones (sem requests extras)
- [x] Lazy loading nativo (loading="lazy")
- [x] Sem dependências externas (exceto fonts)

---

## 📈 SEO

- [x] Meta description única por página
- [x] Canonical URLs
- [x] Schema.org (LocalBusiness, FAQPage)
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Heading hierarchy (h1 → h2 → h3)
- [x] Semantic HTML5 (header, nav, main, section, article, footer)

---

## 📋 Próximos Passos (Deploy)

1. **Hospedagem**: Cloudflare Pages (deploy estático)
2. **DNS**: Registro.br apontando para Cloudflare
3. **SSL**: TLS 1.3 automático via Cloudflare
4. **CI/CD**: GitHub Actions para deploy automático
5. **Formulários**: Integrar endpoint Cloudflare Worker
6. **Analytics**: Adicionar GA4 ID no initAnalytics()
7. **Imagens**: Substituir placeholders por imagens reais (WebP)
8. **Dashboard**: Implementar autenticação JWT

---

**Status**: ✅ Pronto para deploy
**Total**: 15 arquivos | 225 KB | 100% Vanilla Stack
