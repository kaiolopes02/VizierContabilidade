/* ============================================
   VIZIER - MAIN.JS
   ============================================ */

(function() {
  'use strict';

  /* ---------- Config ---------- */
  const CONFIG = {
    empresa: 'Vizier Contabilidade',
    nomeCurto: 'Vizier',
    whatsapp: '5511997965024',
    whatsappFmt: '(11) 99796-5024',
    email: 'contato&#64;viziercontabilidade&#46;com&#46;br',
    instagram: '@vizier.ec',
    instagramUrl: 'https://instagram.com/vizier.ec',
    endereco: 'AVENIDA PAULISTA, Nº 91, CONJ 905, BELA VISTA - SÃO PAULO - SP - 01311000',
    cidade: 'São Paulo',
    estado: 'SP',
    utm: '&utm_source=site&utm_medium=cta&utm_campaign=orcamento'
  };

  // FIX EMAIL: Worker é o ÚNICO caminho. accessKey é server-side (env var),
  // nunca exposta no client. O fallback direto ao StaticForms foi removido porque
  // bypassava validação, honeypot, rate limit e LGPD — e não tinha accessKey.
  // Dev local: use: npx wrangler pages dev (para servir Worker + assets juntos).
  const STATIC_FORMS_ENDPOINT = '/api/submit';
  // Mantido apenas para mensagem de erro útil em dev local sem Worker.
  const isLocalDev = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
      || hostname === '0.0.0.0' || hostname.endsWith('.local');
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // i18n opcional: se /js/i18n.js falhar, tudo continua em pt-BR.
  const tr = (key, fallback) => (typeof window.t === 'function' ? window.t(key, fallback) : fallback);
  const currentLang = () => document.documentElement.lang || 'pt-BR';
  const throttle = (fn, ms) => {
    let last = 0;
    return (...a) => {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(...a); }
    };
  };

  const formatPhone = (v) => {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length === 11) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
    if (n.length === 10) return `(${n.slice(0,2)}) ${n.slice(2,6)}-${n.slice(6)}`;
    if (n.length > 2) return `(${n.slice(0,2)}) ${n.slice(2)}`;
    if (n.length) return `(${n}`;
    return '';
  };

  const formatCnpj = (v) => {
    const n = v.replace(/\D/g, '').slice(0, 14);
    if (n.length > 12) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8,12)}-${n.slice(12)}`;
    if (n.length > 8) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5,8)}/${n.slice(8)}`;
    if (n.length > 5) return `${n.slice(0,2)}.${n.slice(2,5)}.${n.slice(5)}`;
    if (n.length > 2) return `${n.slice(0,2)}.${n.slice(2)}`;
    return n;
  };

  /* ---------- Header / Footer ---------- */
  const initComponents = () => {
    if ($('#header')) return;

    const headerHTML = `
      <header class="header" id="header" role="banner">
        <div class="container">
          <a href="/" class="logo" aria-label="Vizier Contabilidade - Página inicial" data-i18n-aria-label="nav.paginaInicial">
            <img src="/assets/images/Vizier.png" alt="" height="32" style="height:32px; width:auto; border-radius:8px; object-fit:contain;">
            ${CONFIG.nomeCurto}<span>.</span>
          </a>
          <nav class="nav-desktop" role="navigation" aria-label="Navegação principal" data-i18n-aria-label="nav.navPrincipal">
            <a href="/#servicos" data-i18n="nav.servicos">Serviços</a>
            <a href="/#sobre" data-i18n="nav.sobre">Sobre</a>
            <a href="/#processo" data-i18n="nav.processo">Processo</a>
            <a href="/#planos" data-i18n="nav.planos">Planos</a>
            <a href="/pages/faq" data-i18n="nav.faq">FAQ</a>
          </nav>
          <div class="nav-cta">
            <a href="https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=Olá! Vim pelo site e gostaria de um orçamento.${CONFIG.utm}" class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener noreferrer" data-i18n="common.whatsapp" data-wa-msg="wa.orcamento">WhatsApp</a>
            <button type="button" class="btn btn-primary btn-sm" data-modal="orcamento" data-i18n="common.solicitarOrcamento">Solicitar Orçamento</button>
          </div>
          <button type="button" class="mobile-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-mobile" data-i18n-aria-label="nav.abrirMenu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
      <nav class="nav-mobile" id="nav-mobile" role="navigation" aria-label="Menu mobile" data-i18n-aria-label="nav.menuMobile">
        <a href="/#servicos" data-i18n="nav.servicos">Serviços</a>
        <a href="/#sobre" data-i18n="nav.sobre">Sobre</a>
        <a href="/#processo" data-i18n="nav.processo">Processo</a>
        <a href="/#planos" data-i18n="nav.planos">Planos</a>
        <a href="/pages/faq" data-i18n="nav.faq">FAQ</a>
        <a href="/pages/troque-de-contador" data-i18n="nav.troqueContador">Troque de Contador</a>
        <a href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer" data-i18n="nav.instagram">Instagram</a>
        <a href="https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=Olá! Vim pelo site e gostaria de um orçamento.${CONFIG.utm}" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer" data-i18n="common.falarWhatsapp" data-wa-msg="wa.orcamento">Falar no WhatsApp</a>
        <button type="button" class="btn btn-primary" data-modal="orcamento" data-i18n="common.solicitarOrcamento">Solicitar Orçamento</button>
      </nav>
    `;

    const footerHTML = `
      <footer class="footer" role="contentinfo">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="logo">${CONFIG.nomeCurto}<span>.</span></div>
              <p data-i18n="foot.brand">Contabilidade digital com atendimento humano. Simplificamos a gestão do seu negócio para você focar no que realmente importa.</p>
              <div class="footer-social">
                <a href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer" aria-label="Instagram ${CONFIG.instagram}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </a>
              </div>
            </div>
            <div class="footer-links">
              <h4 class="footer-title" data-i18n="nav.servicos">Serviços</h4>
              <a href="/pages/abertura-de-empresa" data-i18n="svc.abertura.title">Abertura de Empresa</a>
              <a href="/pages/contabilidade-mensal" data-i18n="svc.contabilidade.title">Contabilidade Mensal</a>
              <a href="/pages/folha-de-pagamento" data-i18n="svc.folha.title">Folha de Pagamento</a>
              <a href="/pages/declaracoes-fiscais" data-i18n="svc.declaracoes.title">Declarações Fiscais</a>
            </div>
            <div class="footer-links">
              <h4 class="footer-title" data-i18n="foot.institucional">Institucional</h4>
              <a href="/#sobre" data-i18n="foot.sobreNos">Sobre Nós</a>
              <a href="/pages/faq" data-i18n="nav.faq">FAQ</a>
              <a href="/pages/troque-de-contador" data-i18n="nav.troqueContador">Troque de Contador</a>
              <a href="/pages/planos" data-i18n="nav.planos">Planos</a>
            </div>
            <div class="footer-contact">
              <h4 class="footer-title" data-i18n="foot.contato">Contato</h4>
              <p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.5 19.5 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                ${CONFIG.whatsappFmt}
              </p>
              <p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                ${CONFIG.email}
              </p>
              <p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${CONFIG.endereco}<br>${CONFIG.cidade}/${CONFIG.estado}
              </p>
            </div>
          </div>
          <div class="footer-bottom">
            <p>© ${new Date().getFullYear()} ${CONFIG.empresa}. <span data-i18n="foot.direitos">Todos os direitos reservados.</span></p>
            <div class="footer-legal">
              <a href="/pages/politica-de-privacidade" data-i18n="foot.privacidade">Política de Privacidade (LGPD)</a>
              <a href="/pages/termos-de-uso" data-i18n="foot.termos">Termos de Uso</a>
            </div>
          </div>
          <div class="footer-credit" style="text-align:center; padding:1rem 0; border-top:1px solid rgba(255,255,255,0.1);">
            <p style="color:rgba(255,255,255,0.5); font-size:0.8rem; margin:0;">
              <span data-i18n="foot.desenvolvido">Site desenvolvido por</span> <a href="https://www.linkedin.com/in/kaio-lopes-552817275" target="_blank" rel="noopener noreferrer" style="color:#6ee7b7; text-decoration:none; font-weight:600;">Kaio Lopes</a>
            </p>
          </div>
        </div>
      </footer>
    `;

    const wrap = document.createElement('div');
    wrap.innerHTML = headerHTML.trim();
    while (wrap.firstChild) {
      document.body.insertBefore(wrap.firstChild, document.body.firstChild);
    }

    const wrap2 = document.createElement('div');
    wrap2.innerHTML = footerHTML.trim();
    document.body.appendChild(wrap2.firstChild);
  };

  /* ---------- Navigation ---------- */
  const initNavigation = () => {
    const header = $('#header');
    const toggle = $('.mobile-toggle');
    const mobileNav = $('#nav-mobile');
    if (!header || !toggle || !mobileNav) return;

    const handleScroll = throttle(() => {
      window.scrollY > 50 ? header.classList.add('scrolled') : header.classList.remove('scrolled');
    }, 100);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('active');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            const offset = header.offsetHeight || 72;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }
      });
    });
  };

  /* ---------- Scroll Animations (mobile-friendly) ---------- */
  const initScrollAnimations = () => {
    const els = $$('.animate');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });

    els.forEach(el => obs.observe(el));
  };

  /* ---------- Accordion ---------- */
  const initAccordion = () => {
    $$('.faq-item').forEach((item, index) => {
      const q = item.querySelector('.faq-question');
      const panel = item.querySelector('.faq-answer');
      if (!q || !panel) return;

      panel.id = panel.id || `faq-panel-${index + 1}`;
      q.setAttribute('aria-controls', panel.id);

      const setOpen = (open) => {
        item.classList.toggle('active', open);
        q.setAttribute('aria-expanded', String(open));
        // inert (nao hidden): tira da arvore de acessibilidade sem matar a transicao.
        panel.inert = !open;
      };

      q.addEventListener('click', () => {
        const willOpen = !item.classList.contains('active');
        $$('.faq-item').forEach(i => {
          const qq = i.querySelector('.faq-question');
          const pp = i.querySelector('.faq-answer');
          i.classList.remove('active');
          if (qq) qq.setAttribute('aria-expanded', 'false');
          if (pp) pp.inert = true;
        });
        if (willOpen) setOpen(true);
      });

      setOpen(false);
    });
  };

  /* ---------- Modal ---------- */
  const initModal = () => {
    let overlay = null;
    let lastFocus = null;
    let prevOverflow = '';

    const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

    const setBackgroundInert = (on) => {
      document.querySelectorAll('body > *:not(.modal-overlay)').forEach(el => { el.inert = on; });
    };

    // Mantem o Tab dentro do dialogo.
    const trapFocus = (e) => {
      if (e.key !== 'Tab' || !overlay) return;
      const items = [...overlay.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    const create = () => {
      const div = document.createElement('div');
      div.className = 'modal-overlay';
      div.setAttribute('role', 'dialog');
      div.setAttribute('aria-modal', 'true');
      div.setAttribute('aria-labelledby', 'modal-title');
      div.innerHTML = `
        <div class="modal">
          <button type="button" class="modal-close" aria-label="Fechar modal" data-i18n-aria-label="modal.fechar">&times;</button>
          <h3 class="modal-title" id="modal-title">Solicitação de Orçamento</h3>
          <p class="modal-subtitle" id="modal-subtitle" data-i18n="modal.subtitulo">Preencha os dados abaixo e nossa equipe entrará em contato em breve.</p>
          <form id="form-orcamento" action="/api/submit" method="POST">            <div class="form-honeypot" aria-hidden="true">
              <input type="text" name="website" tabindex="-1" autocomplete="off">
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-nome" data-i18n="modal.nome">Nome completo *</label>
              <input type="text" id="modal-nome" name="nome" class="form-input" required minlength="3" placeholder="Seu nome completo" data-i18n-placeholder="modal.nomePh">
              <span class="form-error" data-i18n="modal.nomeErro">Por favor, insira seu nome completo.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-email" data-i18n="modal.email">E-mail *</label>
              <input type="email" id="modal-email" name="email" class="form-input" required placeholder="seu@email.com" data-i18n-placeholder="modal.emailPh">
              <span class="form-error" data-i18n="modal.emailErro">Por favor, insira um e-mail válido.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-whatsapp" data-i18n="modal.whats">WhatsApp *</label>
              <input type="tel" id="modal-whatsapp" name="whatsapp" class="form-input" required placeholder="(11) 98765-4321" maxlength="15">
              <span class="form-error" data-i18n="modal.whatsErro">Por favor, insira um WhatsApp válido.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-tipo" data-i18n="modal.tipo">Tipo de empresa *</label>
              <select id="modal-tipo" name="tipo_empresa" class="form-select" required>
                <option value="" data-i18n="modal.selecione">Selecione...</option>
                <option value="MEI">MEI</option>
                <option value="Simples Nacional">Simples Nacional</option>
                <option value="Lucro Presumido">Lucro Presumido</option>
                <option value="Lucro Real">Lucro Real</option>
                <option value="Outro" data-i18n="modal.outro">Outro</option>
              </select>
              <span class="form-error" data-i18n="modal.tipoErro">Selecione o tipo de empresa.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-servico" data-i18n="modal.servico">Serviço de interesse *</label>
              <select id="modal-servico" name="servico" class="form-select" required>
                <option value="" data-i18n="modal.selecione">Selecione...</option>
                <option value="Abertura de Empresa" data-i18n="svc.abertura.title">Abertura de Empresa</option>
                <option value="Contabilidade Mensal" data-i18n="svc.contabilidade.title">Contabilidade Mensal</option>
                <option value="Folha de Pagamento" data-i18n="svc.folha.title">Folha de Pagamento</option>
                <option value="Declarações Fiscais" data-i18n="svc.declaracoes.title">Declarações Fiscais</option>
                <option value="Planejamento Tributário" data-i18n="svc.tributario.title">Planejamento Tributário</option>
                <option value="Consultoria Contábil" data-i18n="svc.consultoria.title">Consultoria Contábil</option>
                <option value="Troca de Contador" data-i18n="modal.servico.troca">Troca de Contador</option>
              </select>
              <span class="form-error" data-i18n="modal.servicoErro">Selecione um serviço.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-mensagem" data-i18n="modal.mensagem">Mensagem (opcional)</label>
              <textarea id="modal-mensagem" name="mensagem" class="form-textarea" placeholder="Conte-nos mais sobre sua necessidade..." data-i18n-placeholder="modal.mensagemPh"></textarea>
            </div>
            <div class="form-group">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="lgpd-consent" name="lgpd_consent" required>
                <label class="form-check-label" for="lgpd-consent">
                  <span data-i18n="modal.lgpdPre">Declaro que li e concordo com a</span> <a href="/pages/politica-de-privacidade" target="_blank" rel="noopener" data-i18n="modal.lgpdPolitica">Política de Privacidade</a> <span data-i18n="modal.lgpdE">e com o</span> <a href="/pages/termos-de-uso" target="_blank" rel="noopener" data-i18n="modal.lgpdTermos">Termos de Uso</a> <span data-i18n="modal.lgpdPos">da Vizier Contabilidade.</span>
                </label>
                <span class="form-error" data-i18n="modal.lgpdErro">Você precisa aceitar a Política de Privacidade e os Termos de Uso.</span>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Enviar Solicitação</button>
            <p style="text-align:center; margin-top:1rem; font-size:0.8rem; color:var(--text-light);">
              <span data-i18n="modal.notaPre">Ao enviar, você concorda com nossa</span> <a href="/pages/politica-de-privacidade" style="color:var(--primary); text-decoration:underline;" data-i18n="modal.notaLink">Política de Privacidade</a>.
            </p>
          </form>
          <div class="form-success" id="form-success" style="display:none; text-align:center; padding:2rem 1rem;">
            <div class="form-success-icon">✓</div>
            <h4 style="font-size:1.25rem; margin-bottom:0.5rem; color:var(--text-primary);" data-i18n="modal.sucessoTitle">Mensagem enviada com sucesso!</h4>
            <p style="color:var(--text-secondary); font-size:0.95rem;" data-i18n="modal.sucessoText">Aguarde o retorno da nossa equipe.</p>
          </div>
        </div>
      `;
      document.body.appendChild(div);
      div.addEventListener('keydown', trapFocus);
      return div;
    };

    const open = (title = tr('modal.titulo', 'Solicitação de Orçamento'), isTroca = false) => {
      if (!overlay) overlay = create();
      lastFocus = document.activeElement;
      // Set the title
      const titleEl = overlay.querySelector('#modal-title');
      if (titleEl) titleEl.textContent = title;
      overlay.dataset.variant = isTroca ? 'troca' : 'orcamento';
      const submitBtn = overlay.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = tr('modal.enviar', 'Enviar Solicitação');
      
      // Inject extra fields for "Troca de Contador" (Bug #5)
      const form = overlay.querySelector('form');
      const servicoGroup = form.querySelector('[name="servico"]').closest('.form-group');
      const existingTrocaFields = form.querySelector('.troca-extra-fields');
      
      if (isTroca && !existingTrocaFields) {
        const extraFields = document.createElement('div');
        extraFields.className = 'troca-extra-fields';
        extraFields.innerHTML = `
          <div class="form-group">
            <label class="form-label" for="modal-cnpj" data-i18n="modal.cnpj">CNPJ da empresa *</label>
            <input type="text" id="modal-cnpj" name="cnpj" class="form-input" required placeholder="00.000.000/0000-00" maxlength="18">
            <span class="form-error" data-i18n="modal.cnpjErro">Por favor, insira o CNPJ válido.</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="modal-contador-atual" data-i18n="modal.contador">Contador atual *</label>
            <input type="text" id="modal-contador-atual" name="contador_atual" class="form-input" required placeholder="Nome do escritório ou contador" data-i18n-placeholder="modal.contadorPh">
            <span class="form-error" data-i18n="modal.contadorErro">Por favor, informe o contador atual.</span>
          </div>
        `;
        servicoGroup.insertAdjacentElement('afterend', extraFields);
      } else if (!isTroca && existingTrocaFields) {
        existingTrocaFields.remove();
      }
      
      overlay.classList.add('active');
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setBackgroundInert(true);
      setTimeout(() => {
        const inp = overlay.querySelector('#modal-nome');
        if (inp) inp.focus();
      }, 50);
    };

    const close = () => {
      if (!overlay) return;
       
      const form = overlay.querySelector('form');
      // Remove extra fields for "Troca de Contador" on close
      const extraFields = form.querySelector('.troca-extra-fields');
      if (extraFields) extraFields.remove();
      
      if (form) {
        form.reset();
        form.style.display = 'block';
      }
      const formSuccess = overlay.querySelector('#form-success');
      if (formSuccess) formSuccess.style.display = 'none';


      const modalTitle = overlay.querySelector('#modal-title');
      const modalSubtitle = overlay.querySelector('#modal-subtitle');
      if (modalTitle) modalTitle.style.display = '';
      if (modalSubtitle) modalSubtitle.style.display = '';

      // Erro de envio nao pode reaparecer no proximo uso do modal.
      const errEl = overlay.querySelector('#form-submit-error');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      const submitBtn = overlay.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.classList.remove('loading');

      overlay.classList.remove('active');
      setBackgroundInert(false);
      document.body.style.overflow = prevOverflow;
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    };

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal="orcamento"]');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Determine custom title and type. data-modal-tipo mantém a detecção
        // estável após a tradução; o texto continua como fallback.
        const isTroca = trigger.dataset.modalTipo === 'troca' || /transfer|troca/i.test(trigger.textContent);
        const modalTitle = isTroca ? tr('modal.tituloTroca', 'Solicitação de Transferência') : tr('modal.titulo', 'Solicitação de Orçamento');
        open(modalTitle, isTroca);
        return false;
      }
      if (e.target.closest('.modal-close')) {
        e.preventDefault();
        close();
        return;
      }
      if (e.target === overlay) {
        close();
        return;
      }
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay?.classList.contains('active')) close();
    });

    document.addEventListener('vizier:lang', () => {
      if (!overlay || !overlay.classList.contains('active')) return;
      const isTroca = overlay.dataset.variant === 'troca';
      const titleEl = overlay.querySelector('#modal-title');
      if (titleEl) titleEl.textContent = isTroca ? tr('modal.tituloTroca', 'Solicitação de Transferência') : tr('modal.titulo', 'Solicitação de Orçamento');
      const submitBtn = overlay.querySelector('button[type="submit"]');
      if (submitBtn && !submitBtn.classList.contains('loading')) submitBtn.textContent = tr('modal.enviar', 'Enviar Solicitação');
    });
  };

  /* ---------- Form Handler (mailto formatado) ---------- */
  const initFormHandler = () => {
    // Reescrever o valor joga o cursor para o fim; reposiciona pela diferenca de tamanho.
    const mask = (el, maxDigits, formatter) => {
      const pos = el.selectionStart;
      const before = el.value.length;
      el.value = formatter(el.value.replace(/\D/g, '').slice(0, maxDigits));
      if (el.selectionStart !== null) {
        const target = Math.max(0, pos + el.value.length - before);
        el.setSelectionRange(target, target);
      }
    };

    document.addEventListener('input', (e) => {
      if (e.target.matches('input[type="tel"]')) mask(e.target, 11, formatPhone);
      if (e.target.matches('[name="cnpj"]')) mask(e.target, 14, formatCnpj);
    });

    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form.matches('#form-orcamento')) return;

      // FIX MOBILE: preventDefault() sincrono e imediato. Em mobile (CPUs lentas +
      // script com defer), o submit nativo pode competir com o fetch assincrono e
      // disparar um POST bloqueado pelo CSP (falha silenciosa sem erro visivel).
      // Bloquear aqui garante que apenas o caminho AJAX (fetch) rode em qualquer
      // dispositivo. As chamadas preventDefault() mais abaixo tornam-se redundantes
      // (mantidas intencionalmente para nao reescrever a logica de validacao).
      e.preventDefault();

      // Remove previous errors
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

      const honeypot = form.querySelector('[name="website"]');
      if (honeypot?.value) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const getVal = (name) => {
        const el = form.querySelector(`[name="${name}"]`);
        return el ? el.value.trim() : '';
      };

      const nome = getVal('nome');
      const email = getVal('email');
      const whatsapp = getVal('whatsapp');
      const tipoEmpresa = getVal('tipo_empresa');
      const servico = getVal('servico');

      let valid = true;

      if (!nome || nome.length < 3) {
        form.querySelector('[name="nome"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.querySelector('[name="email"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
      }
      // WhatsApp validation: accept 10 digits (landline) or 11 digits (mobile)
      const phoneDigits = whatsapp.replace(/\D/g, '');
      if ((phoneDigits.length !== 10 && phoneDigits.length !== 11) || !/^\(\d{2}\) \d{4,5}-\d{4}$/.test(whatsapp)) {
        form.querySelector('[name="whatsapp"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
      }
      if (form.querySelector('[name="tipo_empresa"]') && !tipoEmpresa) {
        form.querySelector('[name="tipo_empresa"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
      }
      if (form.querySelector('[name="servico"]') && !servico) {
        form.querySelector('[name="servico"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
      }
      // LGPD consent validation (required checkbox)
      const lgpdConsent = form.querySelector('[name="lgpd_consent"]')?.checked || false;
      if (!lgpdConsent) {
        form.querySelector('[name="lgpd_consent"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
      }

      if (!valid) {
        e.preventDefault();
        return;
      }

      // Build FormData
      const formData = new FormData(form);

      // Button loading state
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = tr('modal.enviando', 'Enviando...');
        submitButton.classList.add('loading');
      }

      // Remove honeypot from FormData before submitting (Bug #4)
      formData.delete('website');

      // FIX MOBILE/COMPAT: o front nomeia o telefone como "whatsapp", mas o Worker
      // (functions/api/submit.js) valida o campo "telefone". Sem este mapeamento o
      // Worker retornava 400 ("Campo obrigatorio: telefone") em 100% dos envios,
      // forcando o fallback no frontend e aumentando a chance de falha em rede lenta.
      if (!formData.get('telefone') && formData.get('whatsapp')) {
        formData.append('telefone', formData.get('whatsapp'));
      }

      // FIX MOBILE: helper para limpar/ exibir erros de envio visiveis ao usuario.
      // Sem isso, falhas de rede no mobile (timeout/abort) eram silenciosas — nenhum
      // feedback, nenhum console.error visivel ao usuario, e-mail nao chegava.
      const clearSubmitError = () => {
        const errEl = form.querySelector('#form-submit-error');
        if (errEl) errEl.style.display = 'none';
      };
      const showSubmitError = (message) => {
        let errEl = form.querySelector('#form-submit-error');
        if (!errEl) {
          errEl = document.createElement('div');
          errEl.id = 'form-submit-error';
          errEl.setAttribute('role', 'alert');
          errEl.style.cssText = 'display:block;text-align:center;margin-top:1rem;padding:0.75rem;border-radius:var(--radius);background:#fef2f2;color:#ef4444;font-size:0.875rem;font-weight:500;';
          submitButton.parentNode.insertBefore(errEl, submitButton.nextSibling);
        }
        errEl.textContent = message;
        errEl.style.display = 'block';
      };
      clearSubmitError();

// FIX MOBILE: timeout de 25s via AbortController. Em 3G/4G a latencia pode
      // chegar a 2-3s por RTT, e o Worker faz um segundo fetch (Worker->Formspree)
      // adicionando mais latencia. 25s cobre o pior caso sem ser infinito.
      // DEBUG: se timeout ainda ocorrer em testes mobile, aumente este valor.
      const fetchWithTimeout = (url, options, ms = 25000) => {
        const controller = new AbortController();
       const id = setTimeout(() => controller.abort(), ms);
        return fetch(url, Object.assign({}, options, { signal: controller.signal, headers: Object.assign({}, options.headers, { 'Accept': 'application/json' }) }))
         .then(res => { clearTimeout(id); return res; })
         .catch(err => { clearTimeout(id); throw err; });
     };

      const submitWithFallback = (url) => fetchWithTimeout(url, { method: 'POST', body: formData })
        .then(response => {
          // ponytail: qualquer !ok dispara fallback; dev local já pula /api/submit
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.status === 405 ? 'Method not allowed' : 'Server error'}`);
          }

          const modalContent = form.closest('.modal');
          const formSuccess = modalContent ? modalContent.querySelector('#form-success') : null;

          if (formSuccess) {
            formSuccess.style.display = 'block';
            form.style.display = 'none';


            const modalTitle = modalContent.querySelector('#modal-title');
            const modalSubtitle = modalContent.querySelector('#modal-subtitle');
            if (modalTitle) modalTitle.style.display = 'none';
            if (modalSubtitle) modalSubtitle.style.display = 'none';
            if (submitButton) {
              submitButton.textContent = tr('modal.enviar', 'Enviar Solicitação');
              submitButton.classList.remove('loading');
            }
          } else {
            console.error('[Vizier] Elemento #form-success nao encontrado no DOM do modal.');
            showSubmitError(tr('modal.erroInterno', 'Erro interno ao exibir confirmacao. Tente novamente.'));
          }
});
      // ponytail: local dev simula sucesso apos validacao — testa todo o fluxo
      // UI (modal→preenchimento→validacao→confirmacao) sem depender do Worker.
      const showFormSuccess = () => {
        const modalContent = form.closest('.modal');
        const formSuccess = modalContent ? modalContent.querySelector('#form-success') : null;
        if (formSuccess) {
          formSuccess.style.display = 'block';
          form.style.display = 'none';
          const modalTitle = modalContent.querySelector('#modal-title');
          const modalSubtitle = modalContent.querySelector('#modal-subtitle');
          if (modalTitle) modalTitle.style.display = 'none';
          if (modalSubtitle) modalSubtitle.style.display = 'none';
          if (submitButton) {
            submitButton.textContent = tr('modal.enviar', 'Enviar Solicitação');
            submitButton.classList.remove('loading');
          }
        }
      };

      if (isLocalDev()) {
        setTimeout(showFormSuccess, 800);
        return;
      }

      submitWithFallback(STATIC_FORMS_ENDPOINT)
        .catch((error) => {
          // FIX EMAIL: fallback direto ao StaticForms removido — bypassava validação,
          // honeypot, rate limit, LGPD e não tinha accessKey. Worker é o único caminho.
          console.error('[Vizier] Falha no envio:', error);
          if (submitButton) {
            submitButton.textContent = tr('modal.enviar', 'Enviar Solicitação');
            submitButton.classList.remove('loading');
          }
          const msg = (error && error.name === 'AbortError')
            ? tr('modal.erroTimeout', 'O envio demorou demais. Verifique sua conexao e tente novamente.')
            : isLocalDev()
              ? 'Worker nao disponivel em dev local. Use: npx wrangler pages dev'
              : tr('modal.erroEnvio', 'Nao foi possivel enviar agora. Verifique sua conexao e tente novamente.');
          showSubmitError(msg);
        });
    });
  };

  /* ---------- Counters ---------- */
  const initCounters = () => {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const suffixOf = (el) => (el.dataset.suffixI18n ? tr(el.dataset.suffixI18n, el.dataset.suffix || '') : (el.dataset.suffix || ''));
    const amount = (el, value) => `${el.dataset.prefix || ''}${value.toLocaleString(currentLang())}${suffixOf(el)}`;

    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);
        el.textContent = amount(el, current);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    counters.forEach(c => obs.observe(c));

    document.addEventListener('vizier:lang', () => {
      $$('[data-counter]').forEach(el => {
        el.textContent = amount(el, parseInt(el.dataset.counter, 10));
      });
    });
  };

  /* ---------- LGPD ---------- */
  const initLGPD = () => {
    if (localStorage.getItem('vizier_cookie_consent')) return;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-content container">
        <p><span data-i18n="cookie.textoPre">Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa</span> <a href="/pages/politica-de-privacidade" data-i18n="cookie.politica">Política de Privacidade</a> <span data-i18n="cookie.textoPos">e uso de cookies essenciais.</span></p>
        <div class="cookie-buttons">
          <button type="button" class="btn btn-sm btn-secondary" id="cookie-reject" data-i18n="cookie.recusar">Recusar</button>
          <button type="button" class="btn btn-sm btn-primary" id="cookie-accept" data-i18n="cookie.aceitar">Aceitar</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    setTimeout(() => banner.classList.add('active'), 1000);

    banner.querySelector('#cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem('vizier_cookie_consent', 'accepted');
      banner.classList.remove('active');
      setTimeout(() => banner.remove(), 400);
    });

    banner.querySelector('#cookie-reject')?.addEventListener('click', () => {
      localStorage.setItem('vizier_cookie_consent', 'rejected');
      banner.classList.remove('active');
      setTimeout(() => banner.remove(), 400);
    });
  };

  /* ---------- Floating WhatsApp ---------- */
  const initFloatingWhatsApp = () => {
    if ($('.whatsapp-float')) return;
    const btn = document.createElement('a');
    btn.href = `https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=Olá! Vim pelo site e gostaria de um orçamento.${CONFIG.utm}`;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';
    btn.className = 'whatsapp-float';
    btn.setAttribute('aria-label', 'Falar no WhatsApp');
    btn.setAttribute('data-i18n-aria-label', 'common.falarWhatsapp');
    btn.dataset.waMsg = 'wa.orcamento';
    btn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    `;
    document.body.appendChild(btn);
  };

  /* ---------- Init ---------- */
  const initAll = () => {
    initComponents();
    initNavigation();
    initScrollAnimations();
    initAccordion();
    initModal();
    initFormHandler();
    initCounters();
    initLGPD();
    initFloatingWhatsApp();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
