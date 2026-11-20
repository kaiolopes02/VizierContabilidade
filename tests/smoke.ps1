# Smoke tests do site publicado (assets, headers e URLs).
# Uso:
#   1) npx wrangler pages dev --port 8788 --ip 127.0.0.1   (em outro terminal)
#   2) powershell -File tests/smoke.ps1
param([string]$Base = "http://127.0.0.1:8788")

$script:pass = 0
$script:fail = 0

function Check($name, $expected, $actual) {
  if ("$actual" -like "$expected*") {
    $script:pass++
    Write-Host ("  OK   {0} -> {1}" -f $name, $actual) -ForegroundColor Green
  } else {
    $script:fail++
    Write-Host ("  FAIL {0} -> esperado {1}, obtido {2}" -f $name, $expected, $actual) -ForegroundColor Red
  }
}

function Code($path, $method = "GET", $extra = @()) {
  $args = @("-s", "-o", "NUL", "-w", "%{http_code}", "-X", $method, "$Base$path") + $extra
  (& curl.exe @args)
}

function Body($path, $method = "GET", $extra = @()) {
  $args = @("-s", "-X", $method, "$Base$path") + $extra
  (& curl.exe @args) -join "`n"
}

Write-Host "`n== A. Exposicao e assets ==" -ForegroundColor Cyan
Check "GET /" "200" (Code "/")
Check "GET /wrangler.jsonc (deve dar 404)" "404" (Code "/wrangler.jsonc")
Check "GET /security-audit-out/REPORT.md (404)" "404" (Code "/security-audit-out/REPORT.md")
Check "GET /nao-existe.html (404)" "404" (Code "/nao-existe.html")
Check "GET /_headers (404)" "404" (Code "/_headers")
Check "GET /.dev.vars (404)" "404" (Code "/.dev.vars")
Check "GET /api/submit (Worker removido -> 404)" "404" (Code "/api/submit")
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
Check "CSP libera Web3Forms em connect-src e form-action" "True" (($head -match "connect-src[^;]*https://api\.web3forms\.com") -and ($head -match "form-action[^;]*https://api\.web3forms\.com"))
Check "CSP libera hCaptcha" "True" (($head -match "https://hcaptcha\.com") -and ($head -match "https://\*\.hcaptcha\.com"))
Check "HSTS 1 ano" "True" ($head -match "max-age=31536000")
Check "X-Frame-Options DENY" "True" ($head -match "X-Frame-Options: DENY")
Check "COOP" "True" ($head -match "Cross-Origin-Opener-Policy: same-origin")

Write-Host "`n== C. URLs finais (Pages redireciona .html) ==" -ForegroundColor Cyan
$allPages = @("/") + (Get-ChildItem (Join-Path $PSScriptRoot "../public/pages") -Filter *.html |
  ForEach-Object { "/pages/" + $_.BaseName })
$badPages = @()
foreach ($p in $allPages) { if ((Code $p) -ne "200") { $badPages += $p } }
Check ("todas as {0} paginas retornam 200 sem redirect" -f $allPages.Count) "True" ($badPages.Count -eq 0)
if ($badPages.Count) { $badPages | ForEach-Object { Write-Host "    $_" -ForegroundColor Red } }

Write-Host ("`nRESULTADO: {0} OK, {1} FAIL" -f $script:pass, $script:fail) -ForegroundColor Cyan
if ($script:fail -gt 0) { exit 1 }
