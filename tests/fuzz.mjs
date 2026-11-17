#!/usr/bin/env node
// Fuzz da Pages Function do formulario (functions/api/submit.js).
//
// Camada 1 (in-process): importa o Worker e intercepta o fetch ao StaticForms.
//   Deterministico, sem rede, e mostra exatamente o que SERIA enviado upstream.
// Camada 2 (black-box): HTTP real contra BASE, incluindo bytes crus em socket.
//
// Uso: node tests/fuzz.mjs [baseUrl]
//   node tests/fuzz.mjs                                  # local (wrangler pages dev)
//   node tests/fuzz.mjs https://www.viziercontabilidade.com.br
//
// Nao usa dependencias externas: apenas builtins do Node.

import fs from "node:fs";
import net from "node:net";
import tls from "node:tls";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] || "http://127.0.0.1:8788").replace(/\/+$/, "");
const KEY = "sf_fuzz_dummy_key";
const WORKER = path.join(ROOT, "functions", "api", "submit.js");

const results = [];
const findings = [];

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? "OK  " : "FAIL"} ${name}${detail ? " -> " + detail : ""}`);
}

function expectStatus(name, expected, actual, extra = "") {
  const ok = Array.isArray(expected) ? expected.includes(actual) : actual === expected;
  check(name, ok, `esperado ${expected}, obtido ${actual}${extra ? " | " + extra : ""}`);
}

// ---------------------------------------------------------------- camada 1
// Importa o Worker como ESM e troca o fetch global por um stub que captura
// o FormData que iria para o StaticForms.
const src = fs.readFileSync(WORKER, "utf8");
const worker = await import(
  "data:text/javascript;base64," + Buffer.from(src).toString("base64")
);

let upstream = { status: 200, body: '{"success":true}', throw: false };
let captured = null;
const realFetch = globalThis.fetch; // guarda o HTTP de verdade antes do stub
globalThis.fetch = async (url, init) => {
  captured = { url: String(url), init };
  if (upstream.throw) throw new Error("rede caiu");
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
};

let ipSeq = 0;
const nextIp = () => `203.0.113.${(ipSeq++ % 250) + 2}`;
const SITE_ORIGIN = "https://www.viziercontabilidade.com.br";

async function post(body, { headers = {}, method = "POST", env, origin = SITE_ORIGIN } = {}) {
  captured = null;
  const h = {
    "Content-Type": "application/x-www-form-urlencoded",
    "CF-Connecting-IP": nextIp(),
    ...headers,
  };
  if (origin !== null) h.Origin = origin;
  const request = new Request(`${BASE}/api/submit`, {
    method,
    headers: h,
    body: method === "GET" || method === "HEAD" ? undefined : body,
  });
  const res = await worker.onRequestPost({
    request,
    env: env === undefined ? { STATICFORMS_ACCESS_KEY: KEY } : env,
  });
  return { status: res.status, text: await res.text(), captured };
}

const form = (o) => new URLSearchParams(o).toString();
const VALID = {
  nome: "Fuzz da Silva",
  email: "fuzz@exemplo.com",
  telefone: "11987654321",
  tipo_empresa: "MEI",
  servico: "Contabilidade Mensal",
  lgpd_consent: "on",
};

console.log(`\n== 1. In-process: validacao e forwarding (${BASE}) ==`);

// --- Origin / allowlist -----------------------------------------------------
{
  // Sem Origin nao ha como aplicar a allowlist: o Worker recusaria, o que
  // fecha o relay aberto (achado F1).
  const r = await post(form(VALID), { origin: null });
  expectStatus("POST sem Origin -> 403 (F1 corrigido)", 403, r.status);
}
{
  const r = await post(form(VALID), { origin: SITE_ORIGIN });
  expectStatus("POST com Origin da allowlist", 200, r.status);
}
{
  // Dev local: o navegador manda a origem da propria requisicao.
  const r = await post(form(VALID), { origin: new URL(BASE).origin });
  expectStatus("POST com Origin igual a origem da requisicao", 200, r.status);
}
for (const origin of [
  "https://www.viziercontabilidade.com.br.evil.example",
  "http://www.viziercontabilidade.com.br",
  "null",
  "https://www.viziercontabilidade.com.br:443",
  "https://evil.example",
]) {
  const r = await post(form(VALID), { origin });
  expectStatus(`POST com Origin "${origin}"`, 403, r.status);
}
{
  // Origin vazio cai no mesmo caminho de "sem Origin": header falsificado.
  const r = await post(form(VALID), { origin: "" });
  expectStatus("POST com Origin vazio -> 403", 403, r.status);
}

// --- Campos obrigatorios ----------------------------------------------------
for (const field of Object.keys(VALID)) {
  const body = { ...VALID };
  delete body[field];
  const r = await post(form(body));
  expectStatus(`POST sem "${field}"`, 400, r.status);
}
for (const field of Object.keys(VALID)) {
  const r = await post(form({ ...VALID, [field]: "   " }));
  expectStatus(`POST com "${field}" em branco`, 400, r.status);
}
{
  const r = await post(form({ ...VALID, email: "sem-arroba.exemplo.com" }));
  expectStatus("POST com email invalido", 400, r.status);
}
{
  const r = await post(form({ ...VALID, telefone: "123" }));
  expectStatus("POST com telefone curto", 400, r.status);
}
for (const value of ["on", "true"]) {
  const r = await post(form({ ...VALID, lgpd_consent: value }));
  expectStatus(`POST com lgpd_consent="${value}"`, 200, r.status);
}
for (const value of ["yes", "1", "off"]) {
  const r = await post(form({ ...VALID, lgpd_consent: value }));
  expectStatus(`POST com lgpd_consent="${value}"`, 400, r.status);
}

// --- Limites de tamanho -----------------------------------------------------
{
  const r = await post(form({ ...VALID, nome: "a".repeat(120) }));
  expectStatus("POST com nome no limite (120)", 200, r.status);
}
{
  const r = await post(form({ ...VALID, nome: "a".repeat(121) }));
  expectStatus("POST com nome acima do limite (121)", 400, r.status);
}
{
  const r = await post(form({ ...VALID, mensagem: "m".repeat(4001) }));
  expectStatus("POST com mensagem acima do limite (4001)", 400, r.status);
}
{
  const r = await post(form(VALID), { headers: { "Content-Length": "25000" } });
  expectStatus("POST com Content-Length 25000", 413, r.status);
}
{
  // Content-Length ausente/mentiroso: o limite de 20 KB so olha o header.
  const big = form({ ...VALID, mensagem: "x".repeat(1024 * 1024) });
  const r = await post(big, { headers: { "Content-Length": "10" } });
  const bypassed = r.status !== 413;
  check("POST 1 MB sem Content-Length real nao e barrado por tamanho (nivel de codigo)", bypassed, `status ${r.status}`);
  if (bypassed) findings.push("F2: limite de 20 KB depende so do header Content-Length (mitigado pela edge em producao)");
}

// --- Tipos de corpo ---------------------------------------------------------
{
  const r = await post('{"nome":"x"}', {
    headers: { "Content-Type": "application/json" },
  });
  expectStatus("POST com Content-Type application/json", 400, r.status);
}
{
  const r = await post("qualquer coisa", {
    headers: { "Content-Type": "multipart/form-data; boundary=naoexiste" },
  });
  expectStatus("POST multipart com boundary quebrada", 400, r.status);
}
{
  const r = await post("", { headers: { "Content-Type": "text/plain" } });
  expectStatus("POST com Content-Type text/plain", 400, r.status);
}

// --- Honeypot, duplicatas e campos extras -----------------------------------
{
  const r = await post(form({ ...VALID, website: "spam" }));
  expectStatus("POST com honeypot preenchido", 400, r.status);
}
{
  // Duplicado: FormData.get devolve o primeiro valor -> o vazio vence.
  const r = await post(`lgpd_consent=&nome=Segundo&${form(VALID)}`);
  expectStatus("POST com campo duplicado (vence o primeiro)", 400, r.status);
}
{
  const r = await post(`nome=Primeiro&${form(VALID)}`);
  const sent = r.captured?.init?.body?.get("nome");
  check("campo duplicado usa o primeiro valor", sent === "Primeiro", `enviado=${sent}`);
}
{
  const r = await post(form(VALID) + "&campo_desconhecido=valor-injetado");
  const extra = r.captured?.init?.body?.get("campo_desconhecido");
  check("campo desconhecido e forwarded ao StaticForms", extra === "valor-injetado", `valor=${extra}`);
  if (extra !== null) findings.push("F3: campos nao declarados sao forwarded ao provedor");
}

// --- Sanitizacao do que vai upstream ----------------------------------------
{
  const r = await post(
    form({ ...VALID, assunto: "Pedido\r\nBcc: vitima@exemplo.com", nome: "Fuzz\r\nX-Inj: 1" })
  );
  const subject = r.captured?.init?.body?.get("subject") || "";
  check("CRLF removido do subject enviado upstream", !/[\r\n]/.test(subject), JSON.stringify(subject));
}
{
  const r = await post(form(VALID) + "&accessKey=chave-do-atacante");
  const sent = r.captured?.init?.body?.get("accessKey");
  check("accessKey do cliente e sobrescrito pela secret", sent === KEY, `enviado=${sent}`);
}
{
  const r = await post(form(VALID) + "&subject=subject-do-atacante");
  const sent = r.captured?.init?.body?.get("subject");
  check("subject do cliente e sobrescrito pelo Worker", /Fuzz da Silva/.test(sent || ""), `enviado=${sent}`);
}

// --- Vazamento de segredo / corpo do upstream --------------------------------
{
  upstream = { status: 500, body: '{"error":"CANARY_UPSTREAM_SEGREDO"}', throw: false };
  const r = await post(form(VALID));
  check("corpo de erro do upstream nao vaza para o cliente", !r.text.includes("CANARY_UPSTREAM_SEGREDO"), r.text);
  upstream = { status: 200, body: '{"success":true}', throw: false };
}
{
  upstream = { throw: true };
  const r = await post(form(VALID));
  expectStatus("erro de rede no upstream vira 502", 502, r.status);
  upstream = { status: 200, body: '{"success":true}', throw: false };
}
{
  const r = await post(form(VALID), { env: {} });
  expectStatus("sem secret configurada", 500, r.status);
  check("erro de configuracao nao revela segredo", !r.text.includes(KEY), r.text);
}

// --- Rate limit -------------------------------------------------------------
{
  const ip = "198.18.0.1";
  const codes = [];
  for (let i = 0; i < 12; i++) {
    const r = await post(form(VALID), { headers: { "CF-Connecting-IP": ip } });
    codes.push(r.status);
  }
  check("10 primeiras nao bloqueadas", !codes.slice(0, 10).includes(429), codes.join(","));
  expectStatus("11a bloqueada com 429", 429, codes[10]);
  expectStatus("12a bloqueada com 429", 429, codes[11]);
}
{
  const ip = "198.18.0.2";
  let last = 0;
  for (let i = 0; i < 11; i++) {
    const r = await post(form(VALID), {
      headers: { "CF-Connecting-IP": ip, "X-Forwarded-For": `10.0.0.${i}` },
    });
    last = r.status;
  }
  expectStatus("X-Forwarded-For variando nao contorna o rate limit", 429, last);
}

// --- Metodos ----------------------------------------------------------------
{
  const res = await worker.onRequestGet();
  expectStatus("GET /api/submit", 405, res.status);
}
{
  const res = await worker.onRequestOptions();
  expectStatus("OPTIONS /api/submit", 204, res.status);
  check("OPTIONS nao devolve ACAO curinga", !res.headers.get("Access-Control-Allow-Origin"), "");
}

// ---------------------------------------------------------------- camada 2
console.log(`\n== 2. Black-box: HTTP real contra ${BASE} ==`);

async function live(name, path_, init = {}, expected) {
  try {
    const res = await realFetch(`${BASE}${path_}`, { redirect: "manual", ...init });
    const text = await res.text();
    expectStatus(name, expected, res.status, text.slice(0, 80));
    return res.status;
  } catch (e) {
    check(name, false, `erro: ${e.message}`);
    return 0;
  }
}

const urlencoded = { "Content-Type": "application/x-www-form-urlencoded" };
const site = { ...urlencoded, Origin: SITE_ORIGIN };
// Em local o rate limit conta por CF-Connecting-IP: um IP novo por execucao
// evita colidir com o run anterior. Em producao a Cloudflare bloqueia
// requests que enviam esse header (403 error 1000), entao nao enviamos.
const localIp = /localhost|127\.0\.0\.1/.test(BASE)
  ? { "CF-Connecting-IP": `203.0.113.${(Date.now() % 250) + 2}` }
  : {};

await live("GET /api/submit", "/api/submit", {}, 405);
await live("POST /api/submit sem body", "/api/submit", { method: "POST", headers: { ...site, ...localIp } }, 400);
await live("POST /api/submit sem Origin -> 403", "/api/submit", {
  method: "POST",
  headers: { ...urlencoded, ...localIp },
  body: form(VALID),
}, 403);
await live("POST /api/submit com JSON", "/api/submit", {
  method: "POST",
  headers: { ...site, ...localIp, "Content-Type": "application/json" },
  body: '{"nome":"x"}',
}, 400);
await live("POST multipart quebrado", "/api/submit", {
  method: "POST",
  headers: { ...site, ...localIp, "Content-Type": "multipart/form-data; boundary=naoexiste" },
  body: "lixo",
}, 400);
await live("PUT /api/submit", "/api/submit", { method: "PUT" }, [405, 404, 400]);
await live("DELETE /api/submit", "/api/submit", { method: "DELETE" }, [405, 404, 400]);
await live("HEAD /api/submit", "/api/submit", { method: "HEAD" }, [405, 404, 400]);
await live("OPTIONS /api/submit", "/api/submit", { method: "OPTIONS" }, 204);
await live("POST com Origin nao permitida", "/api/submit", {
  method: "POST",
  headers: { ...urlencoded, ...localIp, Origin: "https://evil.example" },
  body: form(VALID),
}, 403);
await live("POST valido (chave real -> 200, chave de teste -> 502)", "/api/submit", {
  method: "POST",
  headers: { ...site, ...localIp },
  body: form(VALID),
}, [200, 502, 429]);
await live("POST com corpo de 25 KB (Content-Length honesto)", "/api/submit", {
  method: "POST",
  headers: { ...site, ...localIp },
  body: form({ ...VALID, mensagem: "x".repeat(25 * 1024) }),
}, [413, 400, 429]);
{
  // Stream => Transfer-Encoding: chunked, sem Content-Length => o limite de
  // 20 KB do codigo (que so olha o header) nao se aplica. No ambiente real a
  // edge da Cloudflare pode barrar antes com 413.
  const big = form({ ...VALID, mensagem: "x".repeat(1024 * 1024) });
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode(big));
      c.close();
    },
  });
  let status = 0;
  try {
    const res = await realFetch(`${BASE}/api/submit`, {
      method: "POST",
      headers: { ...site, ...localIp },
      body: stream,
      duplex: "half",
    });
    status = res.status;
    await res.text();
  } catch (e) {
    status = -1;
  }
  expectStatus(
    "POST 1 MB em chunked (sem Content-Length) responde com status conhecido",
    [413, 400, 200, 502, 429],
    status,
    status === 413 ? "edge barrou pelo tamanho" : "chegou ao Worker"
  );
}

// --- Bytes crus em socket ---------------------------------------------------
const url = new URL(BASE);
const HOST = url.hostname;
const PORT = Number(url.port || (url.protocol === "https:" ? 443 : 80));
const TLS = url.protocol === "https:";

function raw(payload, wait = 1500) {
  return new Promise((resolve) => {
    let data = "";
    const onData = (d) => (data += d.toString("latin1"));
    const done = () => resolve(data);
    const socket = TLS
      ? tls.connect({ host: HOST, port: PORT, servername: HOST, rejectUnauthorized: false }, () =>
          socket.write(payload)
        )
      : net.connect({ host: HOST, port: PORT }, () => socket.write(payload));
    socket.setTimeout(wait, () => {
      socket.destroy();
      resolve(data);
    });
    socket.on("data", onData);
    socket.on("error", done);
    socket.on("close", done);
  });
}

const rawCases = [
  ["request line invalida", "BOGUS / HTTP/1.1\r\nHost: x\r\n\r\n"],
  ["sem Host", "GET / HTTP/1.1\r\n\r\n"],
  ["header gigante (16 KB)", "GET / HTTP/1.1\r\nHost: x\r\nX-Pad: " + "A".repeat(16000) + "\r\n\r\n"],
  ["Content-Length absurdo (10 GB)", "POST /api/submit HTTP/1.1\r\nHost: x\r\nContent-Length: 9999999999\r\n\r\n"],
  ["chunked malformado", "POST /api/submit HTTP/1.1\r\nHost: x\r\nTransfer-Encoding: chunked\r\n\r\nZZZZ\r\n"], // local: 500 do wrangler dev; edge em prod: 403
  [
    "Content-Length + Transfer-Encoding",
    "POST /api/submit HTTP/1.1\r\nHost: x\r\nContent-Length: 10\r\nTransfer-Encoding: chunked\r\n\r\n0\r\n\r\n",
  ],
  ["corpo gzip sem descompactar", "POST /api/submit HTTP/1.1\r\nHost: x\r\nContent-Encoding: gzip\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: 5\r\n\r\nhello"],
  ["dois requests pipelined", "GET / HTTP/1.1\r\nHost: x\r\n\r\nGET / HTTP/1.1\r\nHost: x\r\n\r\n"],
  ["path traversal na API", "GET /api/../../etc/passwd HTTP/1.1\r\nHost: x\r\n\r\n"],
  ["null byte na URL", "GET /api/submit%00.json HTTP/1.1\r\nHost: x\r\n\r\n"],
];

for (const [name, payload] of rawCases) {
  const out = await raw(payload);
  const statuses = [...out.matchAll(/HTTP\/1\.[01] (\d{3})/g)].map((m) => m[1]);
  const crashed = statuses.includes("500");
  check(
    `raw: ${name} (sem 500/crash)`,
    !crashed,
    `${statuses.join(",") || "sem resposta"} | ${out.slice(0, 220).replace(/\r?\n/g, "|")}`
  );
}

// ---------------------------------------------------------------- resumo
const failed = results.filter((r) => !r.ok);
console.log(`\nRESULTADO: ${results.length - failed.length} OK, ${failed.length} FAIL`);
if (findings.length) {
  console.log("\nOBSERVACOES (para o relatorio):");
  for (const f of [...new Set(findings)]) console.log("  - " + f);
}
if (failed.length) {
  console.log("\nFALHAS:");
  for (const f of failed) console.log(`  - ${f.name} -> ${f.detail}`);
  process.exitCode = 1;
}
