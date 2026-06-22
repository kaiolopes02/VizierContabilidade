# Static Forms Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Static Forms into the Vizier Contabilidade website's budget modal form, replacing the current mailto: implementation with a secure Static Forms submission while maintaining all existing functionality and improving UX.

**Architecture:** Modify the existing form with id="form-orcamento" in the modal to submit to Static Forms API instead of using mailto:. Add required hidden fields, honeypot, LGPD consent checkbox, and client-side validation. Create a thank you page for redirect after successful submission.

**Tech Stack:** HTML, CSS, JavaScript (vanilla), Static Forms API

## Global Constraints

- No new CSS/JS files to be created — modify existing ones only
- Code must be in Portuguese
- No frameworks to be used
- Must not visit Static Forms website during implementation
- Maintain existing visual design and functionality
- Form must work with existing modal system
- Include LGPD compliance checkbox
- Implement honeypot for spam protection
- Provide visual feedback during submission
- Prevent double submission
- Sanitize input data
- Redirect to thank you page after submission
- Ensure minimum 44px touch targets
- Implement visible focus states
- Button must show disabled state during submission

---
### Task 1: Create thank you page for Static Forms redirect

**Files:**
- Create: `/obrigado.html`

**Interfaces:**
- Consumes: None
- Produces: HTML page for Static Forms redirect

- [ ] **Step 1: Create thank you page with appropriate message**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Obrigado - Vizier Contabilidade</title>
    <link rel="stylesheet" href="/css/main.css?v=4">
</head>
<body>
    <main id="main">
        <section class="section" style="min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center;">
            <div class="container">
                <div style="max-width:500px; margin:0 auto; padding:2rem;">
                    <h1 style="color:#022742; margin-bottom:1.5rem;">Mensagem enviada com sucesso!</h1>
                    <p style="color:#475569; font-size:1.1rem; line-height:1.7; margin-bottom:2rem;">
                        Gracias por entrar em contato com a Vizier Contabilidade. Nossa equipe analisará sua solicitação e entrará em contato em até 24h úteis.
                    </p>
                    <a href="/index.html" class="btn btn-primary btn-lg" style="width:100%;">Voltar ao início</a>
                </div>
            </div>
        </section>
    </main>
    <script src="/js/main.js?v=4" defer></script>
</body>
</html>
```

- [ ] **Step 2: Verify thank you page loads correctly**

Open: `/obrigado.html` in browser
Expected: Page displays thank you message with proper styling and return button

- [ ] **Step 3: Commit thank you page**

```bash
git add /obrigado.html
git commit -m "feat: create thank you page for Static Forms redirect"
```

---
### Task 2: Integrate Static Forms into the budget modal form

**Files:**
- Modify: `/index.html` (form structure)
- Modify: `/css/main.css` (touch targets, focus states, button disabled)
- Modify: `/js/main.js` (form validation, submission handling)

**Interfaces:**
- Consumes: Existing modal form structure from main.js
- Produces: Static Forms compatible form with validation

- [ ] **Step 1: Analyze current form structure in modal**

Examine: JavaScript modal creation code in main.js (lines 256-309)
Expected: Form with id="form-orcamento" containing name, email, whatsapp, tipo_empresa, servico, mensagem fields

- [ ] **Step 2: Modify form HTML to include Static Forms required fields**

Change: Form action and method attributes, add hidden inputs, LGPD checkbox
```html
<form id="form-orcamento" action="https://api.staticforms.xyz/submit" method="POST">
    <div class="form-honeypot" aria-hidden="true">
        <input type="text" name="website" tabindex="-1" autocomplete="off">
    </div>
    <input type="hidden" name="accessKey" value="sf_06193e9224b406b37979ed81">
    <input type="hidden" name="redirect" value="/obrigado.html">
    <!-- Existing form fields remain unchanged -->
    <!-- Add LGPD checkbox -->
    <div class="form-group">
        <div class="form-check">
            <input type="checkbox" class="form-check-input" id="lgpd-consent" name="lgpd_consent" required>
            <label class="form-check-label" for="lgpd-consent">
                Declaro que li e concordo com a <a href="/pages/politica-de-privacidade.html" target="_blank">Política de Privacidade</a> e com a <a href="/pages/termos-de-uso.html" target="_blank">Termos de Uso</a> da Vizier Contabilidade.
            </label>
        </div>
    </div>
</form>
```

- [ ] **Step 3: Verify form structure changes**

Open: Any page that triggers the modal (click any "Solicitar proposta" button)
Expected: Form contains Static Forms action, hidden accessKey and redirect fields, LGPD checkbox

- [ ] **Step 4: Commit form structure changes**

```bash
git add /index.html
git commit -m "feat: modify modal form for Static Forms integration"
```

---
### Task 3: Add CSS modifications for touch targets and focus states

**Files:**
- Modify: `/css/main.css`

**Interfaces:**
- Consumes: Existing CSS rules for inputs, buttons, form elements
- Produces: Enhanced CSS with proper touch targets and focus states

- [ ] **Step 1: Ensure minimum 44px touch targets for all form inputs and buttons**

Add/Modify: CSS rules for `.form-input`, `.form-select`, `.form-textarea`, `.btn`
```css
.form-input,
.form-select,
.form-textarea {
    min-height: 44px;
    padding: 0.875rem 1rem;
}

.btn {
    min-height: 44px;
    min-width: 44px;
    padding: 14px 28px;
}
```

- [ ] **Step 2: Implement visible focus states for all interactive elements**

Add/Modify: Focus styles for form elements and buttons
```css
.form-input:focus,
.form-select:focus,
.form-textarea:focus,
.btn:focus {
    outline: 3px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
}

/* Also ensure focus-visible rule is properly defined */
:focus-visible {
    outline: 3px solid var(--primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
}
```

- [ ] **Step 3: Style button disabled state during submission**

Add/Modify: Disabled button styles
```css
.btn:disabled,
.btn[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
```

- [ ] **Step 4: Verify CSS changes**

Inspect: Any form input or button in browser dev tools
Expected: Minimum 44px height, visible focus ring when tabbed to, proper disabled appearance

- [ ] **Step 5: Commit CSS changes**

```bash
git add /css/main.css
git commit -m "feat: add touch target and focus state improvements for Static Forms"
```

---
### Task 4: Add JavaScript modifications for Static Forms integration

**Files:**
- Modify: `/js/main.js`

**Interfaces:**
- Consumes: Existing form handler in initFormHandler()
- Produces: Enhanced form validation and submission handling for Static Forms

- [ ] **Step 1: Locate existing form handler in main.js**

Find: initFormHandler() function (lines 368-493)
Expected: Form submission handler for #form-orcamento and #form-troca

- [ ] **Step 2: Modify form submission handler for Static Forms**

Replace: mailto: submission logic with Static Forms fetch API call
```javascript
document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!form.matches('#form-orcamento, #form-troca')) return;

    e.preventDefault();
    e.stopPropagation();
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

    const honeypot = form.querySelector('[name="website"]');
    if (honeypot?.value) return; // Honeypot protection

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
    const lgpdConsent = form.querySelector('[name="lgpd_consent"]')?.checked || false;

    let valid = true;

    // Custom validation: name ≥2 chars
    if (!nome || nome.length < 2) {
        form.querySelector('[name="nome"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
    }
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.querySelector('[name="email"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
    }
    
    // Brazilian phone validation: (XX) XXXXX-XXXX
    if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(whatsapp)) {
        form.querySelector('[name="whatsapp"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
    }
    
    // LGPD consent validation
    if (!lgpdConsent) {
        form.querySelector('[name="lgpd_consent"]')?.closest('.form-group')?.classList.add('error');
        valid = false;
    }

    if (!valid) return;

    // Prevent double submission
    const btn = form.querySelector('button[type="submit"]');
    if (btn.disabled) return;
    btn.textContent = 'Enviando...';
    btn.disabled = true;

    // Sanitize inputs (trim already applied in getVal)
    // Prepare form data for Static Forms
    const formData = new FormData(form);
    
    // Submit to Static Forms using Fetch API
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok');
    })
    .then(data => {
        // Success - redirect handled by Static Forms redirect parameter
        form.style.display = 'none';
        const successId = form.id === 'form-troca' ? 'form-troca-success' : 'form-success';
        const successDiv = document.getElementById(successId);
        if (successDiv) {
            successDiv.style.display = 'block';
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    })
    .catch(error => {
        // Error handling
        console.error('Static Forms submission error:', error);
        alert('Desculpe, ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
        btn.textContent = 'Enviar Solicitação';
        btn.disabled = false;
    });
});
```

- [ ] **Step 3: Verify JavaScript changes**

Test: Form submission with valid and invalid data
Expected: 
- Invalid data shows field errors
- Valid data disables button, shows "Enviando...", then redirects to thank you page
- Honeypot triggers prevent submission
- Double submission is prevented
- LGPD consent is required

- [ ] **Step 4: Commit JavaScript changes**

```bash
git add /js/main.js
git commit -m "feat: add Static Forms submission with validation and UX improvements"
```

---
### Task 5: Add Static Forms API key and security considerations

**Files:**
- Modify: `/index.html` (already done in Task 2)

**Interfaces:**
- Consumes: None
- Produces: Form with Static Forms API key configured

- [ ] **Step 1: Verify API key is correctly placed**

Check: Hidden input in form with name="accessKey" and value="sf_06193e9224b406b37979ed81"
Expected: API key present in form

- [ ] **Step 2: Document security consideration for public repositories**

Note: Since this is likely a public repository, the API key is exposed in client-side code.
For production in a public repository, consider:
1. Using a proxy/service to hide the key
2. Implementing rate limiting on the Static Forms side
3. Monitoring form submissions for abuse

- [ ] **Step 5: Commit any additional changes (if needed)**

```bash
# No additional changes needed as API key was added in Task 2
```

---
### Task 6: Verify complete implementation

**Files:**
- Verify: All modified files

**Interfaces:**
- Consumes: All previous tasks
- Produces: Fully functional Static Forms integration

- [ ] **Step 1: Test form validation**

Test cases:
- Empty name → shows error
- Name with 1 char → shows error  
- Name with 2+ chars → passes
- Invalid email → shows error
- Valid email → passes
- Invalid phone format → shows error
- Valid Brazilian phone → passes
- Unchecked LGPD → shows error
- Checked LGPD → passes
- Honeypot filled → prevents submission

- [ ] **Step 2: Test form submission**

Test: Valid form submission
Expected: 
- Button disables and shows "Enviando..."
- Form hides
- Success message shows
- Redirects to /obrigado.html
- Thank you page displays properly

- [ ] **Step 3: Test accessibility**

Test: 
- Tab navigation through form elements
- Focus visible on all interactive elements
- Screen reader compatibility (basic check)
- Color contrast verification

- [ ] **Step 4: Test responsive behavior**

Test: 
- Mobile viewport (375px width)
- Tablet viewport (768px width)
- Desktop viewport (1024px+ width)
- All touch targets ≥44px
- Form usable on touch devices

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete Static Forms integration with validation, UX improvements and thank you page"
```
