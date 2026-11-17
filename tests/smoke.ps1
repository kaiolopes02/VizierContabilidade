# Smoke tests do site + Worker. Uso:
#   1) npx wrangler pages dev public --port 8788 --ip 127.0.0.1   (em outro terminal)
#   2) powershell -File tests/smoke.ps1
param([string]$Base = "http://127.0.0.1:8788")

$script:pass = 0
$script:fail = 0
$big = "x" * 25000
# IP aleatorio por execucao: o rate limit e por isolate/Map, e reusar o IP
# de um run anterior faria a suite falhar com 429 sem nada quebrado.
$script:ip = "198.51.100.$((Get-Random -Minimum 2 -Maximum 254))"

function Check($name, $expected, $actual) {
  if ("$actual" -like "$expected*") {
    $script:pass++
    Write-Host ("  OK   {0} -> {1}" -f $name, $actual) -ForegroundColor Green
  } else {
    $script:fail++
    Write-Host ("  FAIL {0} -> esperado {1}, obtido {2}" -f $name, $expected, $actual) -ForegroundColor Red
  }
}

function Code($path, $method = "GET", $extra = @(), $ip = $script:ip) {
  $args = @("-s", "-o", "NUL", "-w", "%{http_code}", "-X", $method, "$Base$path", "-H", "CF-Connecting-IP: $ip") + $extra
  (& curl.exe @args)
}

function Body($path, $method = "GET", $extra = @()) {
  $args = @("-s", "-X", $method, "$Base$path", "-H", "CF-Connecting-IP: $script:ip") + $extra
  (& curl.exe @args) -join "`n"
}

Write-Host "`n== A. Exposicao e assets ==" -ForegroundColor Cyan
Check "GET /" "200" (Code "/")
Check "GET /wrangler.jsonc (deve dar 404)" "404" (Code "/wrangler.jsonc")
Check "GET /security-audit-out/REPORT.md (404)" "404" (Code "/security-audit-out/REPORT.md")
Check "GET /nao-existe.html (404)" "404" (Code "/nao-existe.html")
Check "GET /_headers (404)" "404" (Code "/_headers")
Check "GET /.dev.vars (404)" "404" (Code "/.dev.vars")
Check "GET /robots.txt" "200" (Code "/robots.txt")
Check "GET /sitemap.xml" "200" (Code "/sitemap.xml")
Check "GET /nao-existe.html serve a pagina 404 customizada" "True" ((Body "/nao-existe.html") -match "Erro 404")
Check "GET /assets/icons/favicon-32.png" "200" (Code "/assets/icons/favicon-32.png")
Check "GET /assets/images/Vitor-800.jpeg" "200" (Code "/assets/images/Vitor-800.jpeg")
Check "GET /css/main.css" "200" (Code "/css/main.css")
Check "GET /js/main.js" "200" (Code "/js/main.js")
Check "GET /.well-known/security.txt" "200" (Code "/.well-known/security.txt")

Write-Host "`n== B. Headers de seguranca ==" -ForegroundColor Cyan
$head = (curl.exe -s -I "$Base/") -join "`n"
Check "CSP sem script unsafe-inline" "True" ($head -notmatch "script-src[^;]*'unsafe-inline'")
Check "HSTS 1 ano" "True" ($head -match "max-age=31536000")
Check "X-Frame-Options DENY" "True" ($head -match "X-Frame-Options: DENY")
Check "COOP" "True" ($head -match "Cross-Origin-Opener-Policy: same-origin")

Write-Host "`n== C. Worker: metodo e CORS ==" -ForegroundColor Cyan
Check "GET /api/submit -> 405" "405" (Code "/api/submit")
Check "POST /api/submit sem body -> 400" "400" (Code "/api/submit" "POST")
$opt = (curl.exe -s -i -X OPTIONS "$Base/api/submit") -join "`n"
Check "OPTIONS sem ACAO curinga" "True" ($opt -notmatch "Access-Control-Allow-Origin: \*")

Write-Host "`n== D. Worker: validacao ==" -ForegroundColor Cyan
$valid = @("--data-urlencode", "nome=Teste da Silva", "--data-urlencode", "email=teste@exemplo.com",
  "--data-urlencode", "whatsapp=(11) 98765-4321", "--data-urlencode", "tipo_empresa=MEI",
  "--data-urlencode", "servico=Contabilidade Mensal", "--data-urlencode", "lgpd_consent=on")

Check "POST sem nome -> 400" "400" (Code "/api/submit" "POST" @("--data-urlencode", "email=a@b.com"))
Check "POST email invalido -> 400" "400" (Code "/api/submit" "POST" @($valid[0..1] + @("--data-urlencode", "email=invalido") + $valid[4..9]))
Check "POST telefone curto -> 400" "400" (Code "/api/submit" "POST" @($valid[0..3] + @("--data-urlencode", "whatsapp=123") + $valid[6..9]))
Check "POST sem LGPD -> 400" "400" (Code "/api/submit" "POST" $valid[0..7])
Check "POST honeypot preenchido -> 400" "400" (Code "/api/submit" "POST" ($valid + @("--data-urlencode", "website=spam")))
Check "POST body 25KB -> 413" "413" (Code "/api/submit" "POST" @("-H", "Content-Type: application/x-www-form-urlencoded", "--data-binary", "mensagem=$big"))
Check "POST Origin nao permitida -> 403" "403" (Code "/api/submit" "POST" ($valid + @("-H", "Origin: https://evil.example")))
$bad = Body "/api/submit" "POST" $valid
Check "POST valido chega ao StaticForms (502 com chave de teste)" "True" ($bad -match "Erro ao enviar")

Write-Host "`n== E. Rate limit (10/min por IP) ==" -ForegroundColor Cyan
# IP proprio: o contador de D nao deve interferir na contagem exata.
$eIp = "203.0.113.$((Get-Random -Minimum 2 -Maximum 254))"
$codes = @()
for ($i = 0; $i -lt 12; $i++) { $codes += (Code "/api/submit" "POST" $valid $eIp) }
Check "10 primeiras passam do rate limit" "True" ($codes[0..9] -notcontains "429")
Check "11a requisicao bloqueada com 429" "429" ($codes[10])
Check "12a requisicao bloqueada com 429" "429" ($codes[11])

Write-Host "`n== F. URLs finais (Pages redireciona .html) ==" -ForegroundColor Cyan
$allPages = @("/") + (Get-ChildItem (Join-Path $PSScriptRoot "../public/pages") -Filter *.html |
  ForEach-Object { "/pages/" + $_.BaseName })
$badPages = @()
foreach ($p in $allPages) { if ((Code $p) -ne "200") { $badPages += $p } }
Check ("todas as {0} paginas retornam 200 sem redirect" -f $allPages.Count) "True" ($badPages.Count -eq 0)
if ($badPages.Count) { $badPages | ForEach-Object { Write-Host "    $_" -ForegroundColor Red } }

Write-Host ("`nRESULTADO: {0} OK, {1} FAIL" -f $script:pass, $script:fail) -ForegroundColor Cyan
if ($script:fail -gt 0) { exit 1 }
