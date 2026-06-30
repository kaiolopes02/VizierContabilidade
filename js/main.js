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

  // Static Forms endpoint corrigido para .xyz
  const STATIC_FORMS_ENDPOINT = ['https://', 'api.staticforms.xyz', '/submit'].join('');

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
      <header class="header" id="header" role="banner">
        <div class="container">
          <a href="/index.html" class="logo" aria-label="Vizier Contabilidade - Página inicial">
            <img src="/assets/images/Vizier.png" alt="" height="32" style="height:32px; width:auto; border-radius:8px; object-fit:contain;">
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
            <a href="https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=Olá! Vim pelo site e gostaria de um orçamento.${CONFIG.utm}" class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <button type="button" class="btn btn-primary btn-sm" data-modal="orcamento">Solicitar Orçamento</button>
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
        <a href="${CONFIG.instagramUrl}" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://api.whatsapp.com/send?phone=${CONFIG.whatsapp}&text=Olá! Vim pelo site e gostaria de um orçamento.${CONFIG.utm}" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
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

  /* ---------- Modal ---------- */
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
          <h3 class="modal-title" id="modal-title">Solicitação de Orçamento</h3>
          <p class="modal-subtitle">Preencha os dados abaixo e nossa equipe entrará em contato em breve.</p>
          <form id="form-orcamento" action="https://api.staticforms.xyz/submit" method="POST">
            <input type="hidden" name="accessKey" value="sf_06193e9224b406b37979ed81">
            <input type="hidden" name="redirect" value="https://www.viziercontabilidade.com.br">
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
            <div class="form-group">
              <label class="form-label" for="assunto-usuario">Assunto *</label>
              <input type="text" id="assunto-usuario" name="assunto" class="form-input" placeholder="Assunto da mensagem">
              <span class="form-error">Por favor, informe o assunto.</span>
            </div>
            <input type="hidden" name="subject" id="assunto-final">
            <input type="hidden" name="g-recaptcha-response">
            <div class="form-group">
              <div id="recaptcha-widget" class="g-recaptcha" data-sitekey="6Lf8ci8tAAAAABJYFFKTagVI2OFLbXh85EPeOhRb" data-size="compact" data-expired-callback="recaptchaExpired"></div>
            </div>
            <div class="form-group">
              <div class="form-check">
                <input type="checkbox" class="form-check-input" id="lgpd-consent" name="lgpd_consent" required>
                <label class="form-check-label" for="lgpd-consent">
                  Declaro que li e concordo com a <a href="/pages/politica-de-privacidade.html" target="_blank">Política de Privacidade</a> e com o <a href="/pages/termos-de-uso.html" target="_blank">Termos de Uso</a> da Vizier Contabilidade.
                </label>
              </div>
            </div>
            <div class="form-group">
              <span class="form-error" id="recaptcha-error" style="display:none;">Por favor, marque que você não é um robô.</span>
            </div>
            <button type="submit" class="btn btn-primary btn-lg" style="width:100%">Enviar Solicitação</button>
            <p style="text-align:center; margin-top:1rem; font-size:0.8rem; color:var(--text-light);">
              Ao enviar, você concorda com nossa <a href="/pages/politica-de-privacidade.html" style="color:var(--primary); text-decoration:underline;">Política de Privacidade</a>.
            </p>
          </form>
          <div class="form-success" id="form-success" style="display:none;">
            <div class="form-success-icon">✓</div>
            <h4 style="font-size:1.25rem; margin-bottom:0.5rem; color:var(--text-primary);">Quase lá!</h4>
          </div>
        </div>
      `;
      document.body.appendChild(div);
      // Initialize recaptcha tracking property
      div.recaptchaWidgetId = undefined;
      return div;
    };

    const open = (title = 'Solicitação de Orçamento') => {
      if (!overlay) overlay = create();
      // Set the title
      const titleEl = overlay.querySelector('#modal-title');
      if (titleEl) titleEl.textContent = title;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Clear the reCAPTCHA widget container to avoid "placeholder must be empty" error
      const recaptchaContainer = overlay.querySelector('#recaptcha-widget');
      if (recaptchaContainer) {
        recaptchaContainer.innerHTML = '';
      }
      // Render reCAPTCHA widget if available
      if (window.recaptchaReady && window.grecaptcha && typeof grecaptcha.render === 'function') {
        setTimeout(() => {
          try {
            const widgetId = grecaptcha.render('recaptcha-widget', {
              sitekey: '6Lf8ci8tAAAAABJYFFKTagVI2OFLbXh85EPeOhRb',
              size: 'compact'
            });
            // Store widget ID on the overlay element
            overlay.recaptchaWidgetId = widgetId;
          } catch (e) {
            console.error('reCAPTCHA render error:', e);
          }
        }, 400);
      }
      setTimeout(() => {
        const inp = overlay.querySelector('#modal-nome');
        if (inp) inp.focus();
      }, 50);
    };

    const close = () => {
      if (!overlay) return;
      // Reset reCAPTCHA if widget was rendered
      if (overlay.recaptchaWidgetId !== undefined) {
        try {
          grecaptcha.reset(overlay.recaptchaWidgetId);
        } catch (e) {
          console.error('reCAPTCHA reset error on close:', e);
        }
        overlay.recaptchaWidgetId = undefined;
      }
      
      const form = overlay.querySelector('form');
      const formSuccess = overlay.querySelector('#form-success');
      if (form) form.style.display = 'block';
      if (formSuccess) formSuccess.style.display = 'none';

      overlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-modal="orcamento"]');
      if (trigger) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // Determine custom title based on trigger text
        let modalTitle = 'Solicitação de Orçamento'; // default
        const triggerText = trigger.textContent.trim().toLowerCase();
        if (triggerText.includes('transferência')) {
          modalTitle = 'Solicitação de Transferência';
        } else if (triggerText.includes('proposta')) {
          // keep default or maybe 'Solicitação de Proposta' but we keep default
        }
        open(modalTitle);
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
  };

  /* ---------- Form Handler (mailto formatado) ---------- */
  const initFormHandler = () => {
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

    document.addEventListener('submit', (e) => {
      const form = e.target;
      if (!form.matches('#form-orcamento, #form-troca')) return;

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
      if (!/^\(\d{2}\) \d{4,5}-\d{4}$/.test(whatsapp)) {
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

      // reCAPTCHA validation - ONLY required if widget was successfully rendered
      let recaptchaResponse = '';
      let recaptchaRequired = false;
      const overlay = form.closest('.modal-overlay');
      if (overlay && overlay.recaptchaWidgetId !== undefined) {
        recaptchaRequired = true;
        try {
          if (window.grecaptcha && grecaptcha.getResponse) {
            recaptchaResponse = grecaptcha.getResponse();
          }
        } catch (e) {
          console.error('reCAPTCHA error:', e);
        }
      }

      const recaptchaField = form.querySelector('[name="g-recaptcha-response"]');
      if (recaptchaField) {
        recaptchaField.value = recaptchaResponse;
      }

      if (recaptchaRequired && !recaptchaResponse) {
        const recaptchaError = form.querySelector('#recaptcha-error');
        if (recaptchaError) recaptchaError.style.display = 'block';
        valid = false;

        // Also try to reset recaptcha in case it's in a bad state
        try {
          if (overlay && overlay.recaptchaWidgetId !== undefined) {
            grecaptcha.reset(overlay.recaptchaWidgetId);
          } else if (window.grecaptcha) {
            // Clear the container and re-render
            const recaptchaContainer = form.querySelector('#recaptcha-widget');
            if (recaptchaContainer) {
              recaptchaContainer.innerHTML = '';
              window.recaptchaWidgetId = grecaptcha.render('recaptcha-widget', {
                sitekey: '6Lf8ci8tAAAAABJYFFKTagVI2OFLbXh85EPeOhRb',
                size: 'compact'
              });
            }
          }
        } catch (resetError) {
          console.error('reCAPTCHA reset error:', resetError);
        }
      } else {
        const recaptchaError = form.querySelector('#recaptcha-error');
        if (recaptchaError) recaptchaError.style.display = 'none';
      }

      if (!valid) {
        e.preventDefault();
        return;
      }

      // Always prevent default submission and use AJAX
      e.preventDefault();

      // Build FormData
      const formData = new FormData(form);
      // Ensure recaptcha response is included (it already is via hidden input, but we ensure)
      if (recaptchaResponse) {
        formData.set('g-recaptcha-response', recaptchaResponse);
      }

      // Button loading state
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.textContent = 'Enviando...';
        submitButton.classList.add('loading');
      }

      fetch(STATIC_FORMS_ENDPOINT, {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        
        // Show success state instead of redirecting
        const modalContent = form.closest('.modal');
        const formSuccess = modalContent ? modalContent.querySelector('#form-success') : null;
        
        if (formSuccess) {
          formSuccess.style.display = 'block';
          form.style.display = 'none'; // Hide the form safely
          
          if (submitButton) {
            submitButton.textContent = 'Enviar Solicitação';
            submitButton.classList.remove('loading');
          }
        } else {
          // Fallback UI
          HTMLFormElement.prototype.submit.call(form);
        }
      })
      .catch(error => {
        console.error('Form submission error:', error);
        // Fallback: se fetch() falhar, form.submit() para envio real (Static Forms redireciona pra home configurada)
        HTMLFormElement.prototype.submit.call(form);
      });
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
    }, { threshold: 0.15 });

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

window.recaptchaExpired = function() {
  const err = document.getElementById('recaptcha-error');
  if (err) err.style.display = 'block';
  try {
    if (window.recaptchaWidgetId !== undefined)
      grecaptcha.reset(window.recaptchaWidgetId);
  } catch(e) {}
};