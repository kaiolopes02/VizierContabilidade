/* ============================================
   VIZIER - MAIN.JS (UNIFICADO & CORRIGIDO)
   v2.1 — Modal fix: stopPropagation + button type
   ============================================ */

(function() {
  'use strict';

  /* ---------- Config ---------- */
  const CONFIG = {
    empresa: 'Vizier Contabilidade Empresarial',
    nomeCurto: 'Vizier',
    whatsapp: '5511997965024',
    whatsappFmt: '(11) 99796-5024',
    email: 'contato@viziercontabilidade.com.br',
    emailOrcamento: 'contato@viziercontabilidade.com.br',
    endereco: 'Av. Rio Branco, 1871, Sala 615 - Ed. Rossi / Rio Branco Corporate',
    cidade: 'São Paulo',
    estado: 'SP',
    utm: '&utm_source=site&utm_medium=cta&utm_campaign=orcamento'
  };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const throttle = (fn, ms) => {
    let last = 0;
    return (...a) => {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(...a); }
    };
  };

  const formatPhone = (v) => {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length > 7) return `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`;
    if (n.length > 2) return `(${n.slice(0,2)}) ${n.slice(2)}`;
    if (n.length) return `(${n}`;
    return '';
  };

  /* ---------- Header / Footer ---------- */
  const initComponents = () => {
    if ($('#header')) return;

    const headerHTML = `
      <a href="#main" class="skip-link">Pular para conteúdo</a>
      <header class="header" id="header" role="banner">
        <div class="container">
          <a href="/index.html" class="logo" aria-label="Vizier Contabilidade - Página inicial">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)"/>
              <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="Inter">V</text>
              <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#1e40af"/><stop offset="1" stop-color="#10b981"/></linearGradient></defs>
            </svg>
            ${CONFIG.nomeCurto}<span>.</span>
          </a>
          <nav class="nav-desktop" role="navigation" aria-label="Navegação principal">
            <a href="/index.html#servicos">Serviços</a>
            <a href="/index.html#sobre">Sobre</a>
            <a href="/index.html#processo">Processo</a>
            <a href="/index.html#planos">Planos</a>
            <a href="/pages/faq.html">FAQ</a>
          </nav>
          <div class="nav-cta">
            <a href="https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=Olá! Vim pelo site e gostaria de um orçamento.${CONFIG.utm}" class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener">WhatsApp</a>
            <button type="button" class="btn btn-primary btn-sm" data-modal="orcamento">Orçamento Grátis</button>
          </div>
          <button type="button" class="mobile-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-mobile">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
      <nav class="nav-mobile" id="nav-mobile" role="navigation" aria-label="Menu mobile">
        <a href="/index.html#servicos">Serviços</a>
        <a href="/index.html#sobre">Sobre</a>
        <a href="/index.html#processo">Processo</a>
        <a href="/index.html#planos">Planos</a>
        <a href="/pages/faq.html">FAQ</a>
        <a href="/pages/troque-de-contador.html">Troque de Contador</a>
        <a href="https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=Olá! Vim pelo site e gostaria de um orçamento.${CONFIG.utm}" class="btn btn-whatsapp" target="_blank" rel="noopener">Falar no WhatsApp</a>
        <button type="button" class="btn btn-primary" data-modal="orcamento">Solicitar Orçamento</button>
      </nav>
    `;

    const footerHTML = `
      <footer class="footer" role="contentinfo">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="logo">${CONFIG.nomeCurto}<span>.</span></div>
              <p>Contabilidade digital com atendimento humano. Simplificamos a gestão do seu negócio para você focar no que realmente importa.</p>
            </div>
            <div class="footer-links">
              <h4 class="footer-title">Serviços</h4>
              <a href="/pages/abertura-de-empresa.html">Abertura de Empresa</a>
              <a href="/pages/contabilidade-mensal.html">Contabilidade Mensal</a>
              <a href="/pages/folha-de-pagamento.html">Folha de Pagamento</a>
              <a href="/pages/declaracoes-fiscais.html">Declarações Fiscais</a>
            </div>
            <div class="footer-links">
              <h4 class="footer-title">Institucional</h4>
              <a href="/index.html#sobre">Sobre Nós</a>
              <a href="/pages/faq.html">FAQ</a>
              <a href="/pages/troque-de-contador.html">Troque de Contador</a>
              <a href="/pages/planos.html">Planos</a>
            </div>
            <div class="footer-contact">
              <h4 class="footer-title">Contato</h4>
              <p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
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
            <p>© ${new Date().getFullYear()} ${CONFIG.empresa}. Todos os direitos reservados.</p>
            <div class="footer-legal">
              <a href="/pages/politica-de-privacidade.html">Política de Privacidade (LGPD)</a>
              <a href="/pages/termos-de-uso.html">Termos de Uso</a>
            </div>
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

  /* ---------- Scroll Animations ---------- */
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
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => obs.observe(el));
  };

  /* ---------- Accordion ---------- */
  const initAccordion = () => {
    $$('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-question');
      if (!q) return;

      q.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        $$('.faq-item').forEach(i => {
          i.classList.remove('active');
          const qq = i.querySelector('.faq-question');
          if (qq) qq.setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
          item.classList.add('active');
          q.setAttribute('aria-expanded', 'true');
        }
      });
      q.setAttribute('aria-expanded', 'false');
    });
  };

  /* ---------- Modal (CORRIGIDO: stopPropagation) ---------- */
  const initModal = () => {
    let overlay = null;

    const create = () => {
      const div = document.createElement('div');
      div.className = 'modal-overlay';
      div.setAttribute('role', 'dialog');
      div.setAttribute('aria-modal', 'true');
      div.setAttribute('aria-labelledby', 'modal-title');
      div.innerHTML = `
        <div class="modal">
          <button type="button" class="modal-close" aria-label="Fechar modal">&times;</button>
          <h3 class="modal-title" id="modal-title">Solicitar Orçamento Grátis</h3>
          <p class="modal-subtitle">Preencha os dados abaixo e nossa equipe entrará em contato em breve.</p>
          <form id="form-orcamento" novalidate>
            <div class="form-honeypot" aria-hidden="true">
              <input type="text" name="website" tabindex="-1" autocomplete="off">
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-nome">Nome completo *</label>
              <input type="text" id="modal-nome" name="nome" class="form-input" required minlength="3" placeholder="Seu nome completo">
              <span class="form-error">Por favor, insira seu nome completo.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-email">E-mail *</label>
              <input type="email" id="modal-email" name="email" class="form-input" required placeholder="seu@email.com">
              <span class="form-error">Por favor, insira um e-mail válido.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-whatsapp">WhatsApp *</label>
              <input type="tel" id="modal-whatsapp" name="whatsapp" class="form-input" required placeholder="(11) 98765-4321" maxlength="15">
              <span class="form-error">Por favor, insira um WhatsApp válido.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-tipo">Tipo de empresa *</label>
              <select id="modal-tipo" name="tipo_empresa" class="form-select" required>
                <option value="">Selecione...</option>
                <option value="MEI">MEI</option>
                <option value="Simples Nacional">Simples Nacional</option>
                <option value="Lucro Presumido">Lucro Presumido</option>
                <option value="Lucro Real">Lucro Real</option>
                <option value="Outro">Outro</option>
              </select>
              <span class="form-error">Selecione o tipo de empresa.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-servico">Serviço de interesse *</label>
              <select id="modal-servico" name="servico" class="form-select" required>
                <option value="">Selecione...</option>
                <option value="Abertura de Empresa">Abertura de Empresa</option>
                <option value="Contabilidade Mensal">Contabilidade Mensal</option>
                <option value="Folha de Pagamento">Folha de Pagamento</option>
                <option value="Declarações Fiscais">Declarações Fiscais</option>
                <option value="Planejamento Tributário">Planejamento Tributário</option>
                <option value="Consultoria Contábil">Consultoria Contábil</option>
                <option value="Troca de Contador">Troca de Contador</option>
              </select>
              <span class="form-error">Selecione um serviço.</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="modal-mensagem">Mensagem (opcional)</label>
              <textarea id="modal-mensagem" name="mensagem" class="form-textarea" placeholder="Conte-nos mais sobre sua necessidade..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Enviar Solicitação</button>
            <p style="text-align:center; margin-top:1rem; font-size:0.8rem; color:var(--text-light);">
              Ao enviar, você concorda com nossa <a href="/pages/politica-de-privacidade.html" style="color:var(--primary); text-decoration:underline;">Política de Privacidade</a>.
            </p>
          </form>
          <div class="form-success" id="form-success" style="display:none;">
            <div class="form-success-icon" style="font-size:2.5rem;">📧</div>
            <h4 style="font-size:1.25rem; margin-bottom:0.5rem; color:var(--text-primary);">Quase lá!</h4>
            <p style="color:var(--text-secondary); margin-bottom:1rem;">
              Seu aplicativo de e-mail foi aberto com todos os dados preenchidos.<br>
              <strong style="color:var(--primary); font-size:1.05rem;">Clique em "Enviar" no seu e-mail para finalizar.</strong>
            </p>
            <p style="font-size:0.875rem; color:var(--text-light); margin-bottom:0;">
              Não abriu? <button type="button" id="retry-email" style="color:var(--primary); text-decoration:underline; font-weight:600; background:none; border:none; cursor:pointer; padding:0; font:inherit;">Clique aqui para tentar novamente</button>
            </p>
          </div>
        </div>
      `;
      document.body.appendChild(div);
      return div;
    };

    const open = () => {
      if (!overlay) overlay = create();
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const inp = overlay.querySelector('#modal-nome');
        if (inp) inp.focus();
      }, 50);
    };

    const close = () => {
      if (!overlay) return;
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    /* CAPTURA NO DOCUMENT COM STOPPROPAGATION */
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal="orcamento"]');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        open();
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
      
      /* Retry: reabre o mailto com os mesmos dados */
      if (e.target.closest('#retry-email')) {
        e.preventDefault();
        e.stopPropagation();
        const stored = window.__vizier_last_mailto;
        if (stored) window.location.href = stored;
      }
    }, true); // useCapture = true para pegar antes de outros handlers

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay?.classList.contains('active')) close();
    });
  };

  /* ---------- Form Handler (mailto:) ---------- */
  const initFormHandler = () => {
    /* Máscaras */
    document.addEventListener('input', (e) => {
      if (e.target.matches('input[type="tel"], #whatsapp-troca, #whatsapp, #modal-whatsapp')) {
        e.target.value = formatPhone(e.target.value);
      }
      if (e.target.matches('#cnpj-troca')) {
        let v = e.target.value.replace(/\D/g, '').slice(0, 14);
        if (v.length > 12) e.target.value = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8,12)}-${v.slice(12)}`;
        else if (v.length > 8) e.target.value = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5,8)}/${v.slice(8)}`;
        else if (v.length > 5) e.target.value = `${v.slice(0,2)}.${v.slice(2,5)}.${v.slice(5)}`;
        else if (v.length > 2) e.target.value = `${v.slice(0,2)}.${v.slice(2)}`;
      }
    });

    /* Submit */
    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form.matches('#form-orcamento, #form-troca')) return;

      e.preventDefault();
      e.stopPropagation();
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

      const honeypot = form.querySelector('[name="website"]');
      if (honeypot?.value) return;

      const getVal = (name) => {
        const el = form.querySelector(`[name="${name}"]`);
        return el ? el.value.trim() : '';
      };

      const nome = getVal('nome');
      const email = getVal('email');
      const whatsapp = getVal('whatsapp');
      const tipoEmpresa = getVal('tipo_empresa');
      const servico = getVal('servico');
      const mensagem = getVal('mensagem');
      const cnpj = getVal('cnpj');
      const contadorAtual = getVal('contador_atual');

      let valid = true;

      if (!nome || nome.length < 3) {
        form.querySelector('[name="nome"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.querySelector('[name="email"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
      }
      if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(whatsapp)) {
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
      if (!valid) return;

      /* Monta mailto */
      const isTroca = form.id === 'form-troca';
      const destinatario = CONFIG.emailOrcamento;
      
      const assunto = encodeURIComponent(
        isTroca 
          ? `[VIZIER] Solicitação de Troca de Contador - ${nome}`
          : `[VIZIER] Solicitação de Orçamento - ${nome}`
      );

      const corpoLinhas = [
        `Olá, equipe Vizier!`,
        ``,
        `Recebemos uma nova solicitação pelo site:`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📋 DADOS DO SOLICITANTE`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Nome: ${nome}`,
        `E-mail: ${email}`,
        `WhatsApp: ${whatsapp}`,
      ];

      if (cnpj) corpoLinhas.push(`CNPJ: ${cnpj}`);
      if (tipoEmpresa) corpoLinhas.push(`Tipo de empresa: ${tipoEmpresa}`);
      if (servico) corpoLinhas.push(`Serviço de interesse: ${servico}`);
      if (contadorAtual) corpoLinhas.push(`Contador atual: ${contadorAtual}`);

      corpoLinhas.push(
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📝 MENSAGEM ADICIONAL`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        mensagem || '(Nenhuma mensagem adicional)',
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `📍 ORIGEM`,
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `Página: ${window.location.href}`,
        `Data/hora: ${new Date().toLocaleString('pt-BR')}`,
        `Navegador: ${navigator.userAgent}`,
        ``,
        `---`,
        `E-mail enviado automaticamente pelo site da Vizier Contabilidade`
      );

      const corpo = encodeURIComponent(corpoLinhas.join('\n'));
      const mailtoLink = `mailto:${destinatario}?subject=${assunto}&body=${corpo}`;

      /* Guarda para retry */
      window.__vizier_last_mailto = mailtoLink;

      /* Abre cliente de e-mail */
      window.location.href = mailtoLink;

      /* Feedback visual */
      form.style.display = 'none';
      const successId = isTroca ? 'form-troca-success' : 'form-success';
      const successDiv = document.getElementById(successId);
      
      if (successDiv) {
        successDiv.style.display = 'block';
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  };

  /* ---------- Counters ---------- */
  const initCounters = () => {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.counter, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(ease * target);
        el.textContent = `${prefix}${current.toLocaleString('pt-BR')}${suffix}`;
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
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
  };

  /* ---------- LGPD ---------- */
  const initLGPD = () => {
    if (localStorage.getItem('vizier_cookie_consent')) return;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
      <div class="cookie-content container">
        <p>Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa <a href="/pages/politica-de-privacidade.html">Política de Privacidade</a> e uso de cookies essenciais.</p>
        <div class="cookie-buttons">
          <button type="button" class="btn btn-sm btn-secondary" id="cookie-reject">Recusar</button>
          <button type="button" class="btn btn-sm btn-primary" id="cookie-accept">Aceitar</button>
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

  /* ---------- Lazy Loading ---------- */
  const initLazyLoading = () => {
    const imgs = $$('img[data-src]');
    if (!imgs.length) return;

    if ('loading' in HTMLImageElement.prototype) {
      imgs.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    } else {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            obs.unobserve(img);
          }
        });
      });
      imgs.forEach(img => obs.observe(img));
    }
  };

  /* ---------- Floating WhatsApp ---------- */
  const initFloatingWhatsApp = () => {
    if ($('.whatsapp-float')) return;
    const btn = document.createElement('a');
    btn.href = `https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=Olá! Vim pelo site e gostaria de um orçamento.${CONFIG.utm}`;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.className = 'whatsapp-float';
    btn.setAttribute('aria-label', 'Falar no WhatsApp');
    btn.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    `;
    document.body.appendChild(btn);
  };

  /* ---------- Impostômetro ---------- */
  const initImpostometro = () => {
    const el = $('#impostometro-value');
    if (!el) return;

    let value = 2847500000;
    const increment = () => {
      value += Math.floor(Math.random() * 1001) + 500;
      el.textContent = `R$ ${(value / 1000000).toFixed(2)}M`;
    };

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const interval = setInterval(increment, 2500);
          obs.unobserve(entry.target);
          setTimeout(() => clearInterval(interval), 30000);
        }
      });
    }, { threshold: 0.3 });

    obs.observe(el.closest('.impostometro') || el);
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
    initLazyLoading();
    initFloatingWhatsApp();
    initImpostometro();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();