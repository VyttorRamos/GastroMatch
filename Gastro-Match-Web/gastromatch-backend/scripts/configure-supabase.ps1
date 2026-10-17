$ErrorActionPreference = 'Stop'
$backendRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$projectRef = 'sulyzeupqmgdkgwjspzx'
$defaultPoolerHost = 'aws-0-us-east-1.pooler.supabase.com'

Write-Host 'Configure a conexão do GastroMatch com o Supabase.'
Write-Host 'Use o host exato mostrado em Connect > ORM > Prisma > .env.local.'
$poolerHost = Read-Host "Host do pooler [$defaultPoolerHost]"
if ([string]::IsNullOrWhiteSpace($poolerHost)) { $poolerHost = $defaultPoolerHost }
if ($poolerHost -notmatch '^[A-Za-z0-9.-]+$') { throw 'Host inválido.' }

$securePassword = Read-Host 'Nova senha do banco (a entrada fica oculta)' -AsSecureString
if ($securePassword.Length -eq 0) { throw 'A senha não pode ficar vazia.' }
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}
$encodedPassword = [Uri]::EscapeDataString($plainPassword)
$plainPassword = $null

$runtimeUrl = "postgresql://postgres.$projectRef`:$encodedPassword@$poolerHost`:5432/postgres"
$schemaUrl = "postgresql://postgres.$projectRef`:$encodedPassword@$poolerHost`:5432/postgres"
$envPath = Join-Path $backendRoot '.env'
$lines = [System.Collections.Generic.List[string]]::new()
if (Test-Path -LiteralPath $envPath) {
  foreach ($line in [System.IO.File]::ReadAllLines($envPath)) {
    if ($line -match '^\s*DATABASE_URL=') {
      $lines.Add("DATABASE_URL=`"$runtimeUrl`"")
    } elseif ($line -match '^\s*DIRECT_URL=') {
      $lines.Add("DIRECT_URL=`"$schemaUrl`"")
    } else {
      $lines.Add($line)
    }
  }
}
if (-not [bool]($lines -match '^\s*DATABASE_URL=')) { $lines.Add("DATABASE_URL=`"$runtimeUrl`"") }
if (-not [bool]($lines -match '^\s*DIRECT_URL=')) { $lines.Add("DIRECT_URL=`"$schemaUrl`"") }
[System.IO.File]::WriteAllLines($envPath, $lines, [System.Text.UTF8Encoding]::new($false))
$runtimeUrl = $null
$schemaUrl = $null
$encodedPassword = $null
Write-Host 'Conexões salvas no .env local (ignorado pelo Git).'

Push-Location $backendRoot
try {
  npm run prisma:generate
  if ($LASTEXITCODE -ne 0) { throw 'A geração do Prisma Client falhou.' }
  npm run db:push
  if ($LASTEXITCODE -ne 0) { throw 'O Prisma não conseguiu aplicar o schema. Confira host e conectividade.' }
} finally {
  Pop-Location
}
