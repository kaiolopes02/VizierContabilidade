// Testes estaticos do formulario Web3Forms (sem dependencias).
// Uso: node tests/forms.mjs
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const main = read("public/js/main.js");
const headers = read("public/_headers");
const i18n = read("public/js/i18n.js");
const privacidade = read("public/pages/politica-de-privacidade.html");
const termos = read("public/pages/termos-de-uso.html");
const KEY = "6a9190b9-2c91-4546-9abe-e394fc0554bb";

const htmls = ["public/index.html", "public/404.html"]
  .concat(readdirSync(join(root, "public/pages")).filter((f) => f.endsWith(".html")).map((f) => `public/pages/${f}`));

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };

// --- Markup gerado em main.js ---
ok(main.includes('action="https://api.web3forms.com/submit"'), "action aponta para Web3Forms");
ok(/<form[^>]*method="POST"/.test(main), "form usa method=POST");
ok(main.includes('name="access_key"') && main.includes(KEY), "access_key presente com a chave");
ok(main.includes('<input type="checkbox" name="botcheck" class="hidden" style="display:none !important" tabindex="-1" autocomplete="off">'), "honeypot botcheck exato");

for (const field of ["name", "email", "message", "whatsapp", "tipo_empresa", "servico", "lgpd_consent"]) {
  ok(main.includes(`name="${field}"`), `campo ${field} presente`);
}
ok(main.includes('name="cnpj"') && main.includes('name="contador_atual"'), "campos extras da troca de contador");
ok(/id="modal-email"[^>]*type="email"|type="email"[^>]*id="modal-email"/.test(main), "e-mail com type=email");
ok(/id="modal-nome"[^>]*required/.test(main) && /id="modal-email"[^>]*required/.test(main), "campos obrigatorios");
ok(/id="modal-nome"[^>]*maxlength="100"/.test(main), "nome com maxlength");
ok(/id="modal-email"[^>]*maxlength="254"/.test(main), "email com maxlength");
ok(/id="modal-mensagem"[^>]*maxlength="2000"/.test(main), "mensagem com maxlength");
ok(/id="modal-nome"[^>]*autocomplete="name"/.test(main), "nome com autocomplete");
ok(/id="modal-email"[^>]*autocomplete="email"/.test(main), "email com autocomplete");
ok(/id="modal-whatsapp"[^>]*autocomplete="tel"/.test(main), "whatsapp com autocomplete");
ok((main.match(/<label class="form-label" for="modal-/g) || []).length >= 6, "labels associados aos campos");

// --- Handler ---
ok(main.includes("const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'"), "endpoint constante");
ok(main.includes("headers: { 'Accept': 'application/json' }"), "header Accept JSON");
ok(main.includes("!response.ok || !data.success"), "checa status HTTP e success");
ok(main.includes("errEl.textContent = message"), "erro exibido via textContent");
ok(main.includes("submitButton.disabled = true"), "botao desabilitado no envio");
ok(/finally\(\(\) => \{[\s\S]*disabled = false/.test(main), "botao reabilitado no finally");
ok(main.includes("AbortSignal.timeout(20000)"), "envio com timeout de 20s");
ok(!main.includes("innerHTML = message") && !main.includes("innerHTML = error"), "nenhum innerHTML com dado de usuario");

// --- CSP ---
ok(/connect-src[^;]*https:\/\/api\.web3forms\.com/.test(headers), "CSP connect-src libera Web3Forms");
ok(/form-action[^;]*https:\/\/api\.web3forms\.com/.test(headers), "CSP form-action libera Web3Forms");

// --- CSP do hCaptcha ---
ok(/script-src[^;]*https:\/\/hcaptcha\.com[^;]*https:\/\/\*\.hcaptcha\.com/.test(headers), "CSP script-src permite hCaptcha");
ok(/frame-src[^;]*https:\/\/hcaptcha\.com[^;]*https:\/\/\*\.hcaptcha\.com/.test(headers), "CSP frame-src permite hCaptcha");
ok(/connect-src[^;]*https:\/\/hcaptcha\.com[^;]*https:\/\/\*\.hcaptcha\.com/.test(headers), "CSP connect-src permite hCaptcha");
ok(headers.includes("frame-ancestors 'none'"), "frame-ancestors continua none");

// --- Versoes de cache em todas as paginas ---
for (const f of htmls) {
  const html = read(f);
  ok(html.includes("/js/main.js?v=12"), `${f} usa main.js?v=12`);
  ok(html.includes("/js/i18n.js?v=6"), `${f} usa i18n.js?v=6`);
  ok(!html.includes("/js/i18n.js?v=5"), `${f} nao usa i18n.js?v=5`);
  ok((html.match(/\/js\/i18n\.js\?v=6/g) || []).length === 1, `${f} usa i18n.js?v=6 exatamente uma vez`);
}

// --- Transparencia LGPD do hCaptcha ---
ok(privacidade.includes("Provedores que tratam dados em nosso nome"), "politica identifica os provedores sem confundir operador LGPD e controlador");
ok(privacidade.includes("O formulário também utiliza o hCaptcha") && privacidade.includes("Intuition Machines, Inc."), "politica descreve o hCaptcha sem atribuir papel juridico nao confirmado");
ok(privacidade.includes("hCaptcha"), "politica em portugues cita hCaptcha");
const privtext4a = [...i18n.matchAll(/'privtext4a': "([^"]+)"/g)].map((m) => m[1]);
ok(privtext4a.length === 2, "privtext4a traduzido em en-US e es");
ok(privtext4a.every((text) => text.includes("hCaptcha")), "traducoes en-US e es citam hCaptcha");
ok(privtext4a.some((text) => text.includes("The form also uses hCaptcha") && text.includes("Intuition Machines, Inc.")), "traducao en-US descreve o hCaptcha sem atribuir papel juridico nao confirmado");
ok(privtext4a.some((text) => text.includes("El formulario también utiliza hCaptcha") && text.includes("Intuition Machines, Inc.")), "traducao es descreve o hCaptcha sem atribuir papel juridico nao confirmado");
ok(privtext4a.some((text) => text.includes("IP address") && text.includes("browser and device information") && text.includes("interactions with the security challenge")), "traducao en-US descreve os dados tecnicos do hCaptcha");
ok(privtext4a.some((text) => text.includes("dirección IP") && text.includes("navegador y el dispositivo") && text.includes("interacciones con el desafío de seguridad")), "traducao es descreve os dados tecnicos do hCaptcha");
ok(privacidade.includes("endereço IP") && privacidade.includes("navegador e dispositivo") && privacidade.includes("interações com o desafio de segurança"), "politica descreve os dados tecnicos do hCaptcha");
ok(privacidade.includes('data-i18n="privupdated"') && privacidade.includes("20 de novembro de 2026"), "politica tem data propria de atualizacao");
const legalUpdated = [...i18n.matchAll(/'legal.updated': "([^"]+)"/g)].map((m) => m[1]);
const privUpdated = [...i18n.matchAll(/'privupdated': "([^"]+)"/g)].map((m) => m[1]);
ok(legalUpdated.length === 2 && legalUpdated.some((text) => text === "Last updated: May 26, 2026") && legalUpdated.some((text) => text === "Última actualización: 26 de mayo de 2026"), "data dos termos traduzida permanece inalterada");
ok(privUpdated.length === 2 && legalUpdated.every((text, index) => text !== privUpdated[index]), "data da politica e diferente da data dos termos nos dois idiomas");
ok(privacidade.includes('data-i18n="privupdated"') && privacidade.includes("20 de novembro de 2026"), "politica tem data propria de atualizacao");
ok(termos.includes('data-i18n="legal.updated"') && termos.includes("26 de maio de 2026"), "fallback da data dos termos permanece inalterado");

// --- Residuos do provedor antigo ---
const residuos = [
  ["public/js/main.js", main],
  ["public/_headers", headers],
  ["public/pages/politica-de-privacidade.html", privacidade],
  ["public/js/i18n.js", i18n]
];
for (const [f, text] of residuos) {
  ok(!/staticforms/i.test(text), `${f} sem StaticForms`);
  ok(!text.includes("/api/submit"), `${f} sem /api/submit`);
  ok(!/STATICFORMS|accessKey/.test(text), `${f} sem accessKey antigo`);
  ok(!text.includes('name="website"'), `${f} sem honeypot antigo`);
}
ok(privacidade.includes("Web3Forms") && i18n.includes("Web3Forms"), "politica e i18n citam Web3Forms");
ok(!existsSync(join(root, "functions/api/submit.js")), "Worker do formulario removido");
ok(!existsSync(join(root, "tests/fuzz.mjs")), "fuzz antigo removido");

// --- hCaptcha: barreira server-side do F2 ---
ok(main.includes("const HCAPTCHA_SITEKEY = '50b2fe65-b00b-4b9e-ad62-3ba471098be2'"), "sitekey do hCaptcha (plano gratis do Web3Forms)");
const hcaptchaScriptUrl = main.match(/const HCAPTCHA_SCRIPT = '([^']+)'/)?.[1] ?? '';
ok(hcaptchaScriptUrl === 'https://js.hcaptcha.com/1/api.js?render=explicit&onload=vizierHCaptchaReady&recaptchacompat=off', "script do hCaptcha usa render=explicit, onload e recaptchacompat=off");
ok(main.includes('id="hcaptcha-widget"') && main.includes('class="h-captcha"'), "widget do hCaptcha no modal");
const formStart = main.indexOf('<form id="form-orcamento"');
const formEnd = main.indexOf('</form>', formStart);
const formMarkup = formStart !== -1 && formEnd !== -1 ? main.slice(formStart, formEnd) : '';
ok(formMarkup.includes('id="hcaptcha-widget"'), "container do hCaptcha dentro do form-orcamento");
ok(main.includes("h-captcha-response"), "le o token h-captcha-response");
ok(main.includes("typeof window.hcaptcha !== 'undefined'"), "verifica a API hcaptcha em minusculas");
ok(main.includes("window.hcaptcha.render("), "renderiza o widget pela API hcaptcha em minusculas");
ok(!/\bhCaptcha\b/.test(main), "API hCaptcha com casing incorreto ausente");
ok((i18n.match(/'modal\.captchaErro'/g) || []).length === 3, "mensagem de erro do captcha nos 3 idiomas");
const ensureHCaptchaSource = main.match(/const ensureHCaptcha = \(container\) => \{([\s\S]*?)\n  \};/)?.[1] ?? '';
const hcaptchaCallbackPos = main.indexOf('window.vizierHCaptchaReady = render;');
const hcaptchaAppendPos = main.indexOf('document.head.appendChild(s)');
ok(hcaptchaCallbackPos !== -1 && hcaptchaAppendPos !== -1 && hcaptchaCallbackPos < hcaptchaAppendPos, "callback onload do hCaptcha definido antes de anexar o script");
ok(ensureHCaptchaSource.includes('window.vizierHCaptchaReady = render;'), "callback onload usa a função de render");
ok(/if \(hcaptchaWidgetId !== null \|\| typeof window\.hcaptcha === 'undefined'\) return;/.test(ensureHCaptchaSource), "guard do widget evita render duplicado");
ok(/s\.addEventListener\('load', \(\) => \{\s*setTimeout\(\(\) => \{\s*if \(hcaptchaWidgetId === null\) render\(\);\s*\}, 50\);\s*\}, \{ once: true \}\);/.test(ensureHCaptchaSource), "fallback tardio renderiza somente quando o widget ainda nao foi renderizado");
ok(!/s\.addEventListener\('load',\s*render\b/.test(ensureHCaptchaSource), "listener load nao chama render incondicionalmente");
ok(/const widgetId = window\.hcaptcha\.render\([^;]+\);\s*if \(widgetId\) hcaptchaWidgetId = widgetId;/.test(ensureHCaptchaSource), "ID do widget so e atribuido quando render devolve valor verdadeiro");
const hcaptchaErrorListener = main.match(/s\.addEventListener\('error', \(\) => \{([\s\S]*?)\n    \}, \{ once: true \}\);/)?.[1] ?? '';
ok(hcaptchaErrorListener.includes('hcaptchaFailed = true'), "listener de erro do hCaptcha define hcaptchaFailed = true");

const gateRequestInfo = (match) => {
  const body = match?.[1] ?? '';
  const returnOffset = body.search(/\breturn;/);
  const bodyStart = match ? match.index + match[0].indexOf(body) : -1;
  return {
    body,
    returnPos: returnOffset === -1 ? -1 : bodyStart + returnOffset,
    beforeReturn: returnOffset === -1 ? '' : body.slice(0, returnOffset)
  };
};
const hcaptchaGateMatch = main.match(/if \(hcaptchaFailed\) \{([\s\S]*?)\n      \}/);
const hcaptchaGatePos = hcaptchaGateMatch?.index ?? -1;
const hcaptchaGateInfo = gateRequestInfo(hcaptchaGateMatch);
const emptyTokenGateMatch = main.match(/if \(!captchaToken\) \{([\s\S]*?)\n      \}/);
const emptyTokenGateInfo = gateRequestInfo(emptyTokenGateMatch);
const captchaTokenPos = main.indexOf('const captchaToken =');
const formDataPos = main.indexOf('const formData = new FormData(form)');
const fetchPos = main.indexOf('fetch(WEB3FORMS_ENDPOINT');
const requestPattern = /\bfetch\s*\(|\bnew\s+FormData\s*\(/;
ok(/showSubmitError\(tr\('modal\.erroEnvio'/.test(hcaptchaGateInfo.body), "gate do hCaptcha usa modal.erroEnvio");
ok(hcaptchaGateInfo.returnPos !== -1 && !requestPattern.test(hcaptchaGateInfo.beforeReturn), "gate do hCaptcha nao cria FormData nem envia request antes do return");
ok(hcaptchaGatePos !== -1 && hcaptchaGatePos < captchaTokenPos, "gate do hCaptcha acontece antes da leitura do token");
ok(hcaptchaGateInfo.returnPos !== -1 && hcaptchaGateInfo.returnPos < formDataPos, "return do gate do hCaptcha acontece antes de montar o FormData");
ok(hcaptchaGateInfo.returnPos !== -1 && hcaptchaGateInfo.returnPos < fetchPos, "return do gate do hCaptcha acontece antes do fetch");
ok(emptyTokenGateInfo.returnPos !== -1 && !requestPattern.test(emptyTokenGateInfo.beforeReturn), "gate de token vazio nao cria FormData nem envia request antes do return");
ok(emptyTokenGateInfo.returnPos !== -1 && emptyTokenGateInfo.returnPos < formDataPos, "return do gate de token vazio acontece antes de montar o FormData");
ok(emptyTokenGateInfo.returnPos !== -1 && emptyTokenGateInfo.returnPos < fetchPos, "return do gate de token vazio acontece antes do fetch");

const failedSendMatch = main.match(/\.catch\(\(error\) => \{([\s\S]*?)\n        \}\)/);
const failedSend = failedSendMatch?.[1] ?? '';
const modalCloseMatch = main.match(/const close = \(\) => \{([\s\S]*?)\n    \};/);
const modalClose = modalCloseMatch?.[1] ?? '';
ok(failedSendMatch !== null && failedSend.includes("window.hcaptcha.reset(hcaptchaWidgetId)"), "falha de envio reseta o widget hcaptcha");
ok(modalCloseMatch !== null && modalClose.includes("window.hcaptcha.reset(hcaptchaWidgetId)"), "fechamento do modal reseta o widget hcaptcha");

console.log(`forms: ${n} verificacoes OK`);
