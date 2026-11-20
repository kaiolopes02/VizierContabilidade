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
  ok(html.includes("/js/main.js?v=9"), `${f} usa main.js?v=9`);
  ok(html.includes("/js/i18n.js?v=3"), `${f} usa i18n.js?v=3`);
}

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
ok(main.includes("const HCAPTCHA_SCRIPT = 'https://js.hcaptcha.com/1/api.js?render=explicit'"), "script do hCaptcha com render=explicit");
ok(main.includes('id="hcaptcha-widget"') && main.includes('class="h-captcha"'), "widget do hCaptcha no modal");
ok(main.includes("h-captcha-response"), "le o token h-captcha-response");
ok(main.indexOf("h-captcha-response") < main.indexOf("const formData = new FormData(form)"), "gate do captcha acontece antes de montar o FormData");
ok(main.includes("hCaptcha.reset("), "reseta o widget do hCaptcha");
ok((i18n.match(/'modal\.captchaErro'/g) || []).length === 3, "mensagem de erro do captcha nos 3 idiomas");
const hcaptchaErrorListener = main.match(/s\.addEventListener\('error', \(\) => \{([\s\S]*?)\n    \}, \{ once: true \}\);/)?.[1] ?? '';
ok(hcaptchaErrorListener.includes('hcaptchaFailed = true'), "listener de erro do hCaptcha define hcaptchaFailed = true");

const hcaptchaGateMatch = main.match(/if \(hcaptchaFailed\) \{([\s\S]*?)\n      \}/);
const hcaptchaGate = hcaptchaGateMatch?.[1] ?? '';
const hcaptchaGatePos = hcaptchaGateMatch?.index ?? -1;
const captchaTokenPos = main.indexOf('const captchaToken =');
const formDataPos = main.indexOf('const formData = new FormData(form)');
const fetchPos = main.indexOf('fetch(WEB3FORMS_ENDPOINT');
ok(/showSubmitError\(tr\('modal\.erroEnvio'/.test(hcaptchaGate), "gate do hCaptcha usa modal.erroEnvio");
ok(/\breturn;/.test(hcaptchaGate), "gate do hCaptcha retorna antes de continuar o envio");
ok(hcaptchaGatePos !== -1 && hcaptchaGatePos < captchaTokenPos, "gate do hCaptcha acontece antes da leitura do token");
ok(hcaptchaGatePos !== -1 && hcaptchaGatePos < formDataPos, "gate do hCaptcha acontece antes de montar o FormData");
ok(hcaptchaGatePos !== -1 && hcaptchaGatePos < fetchPos, "gate do hCaptcha acontece antes do fetch");

console.log(`forms: ${n} verificacoes OK`);
