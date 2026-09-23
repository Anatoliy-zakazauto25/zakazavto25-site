param(
  [string]$Name = "init"
)

$ErrorActionPreference = "Stop"

if (-not $env:DATABASE_URL) {
  throw "DATABASE_URL must be set before generating a migration."
}

$migrationRoot = Join-Path $PSScriptRoot "..\prisma\migrations"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationName = "${timestamp}_$Name"
$migrationDirectory = Join-Path $migrationRoot $migrationName

if (Test-Path -LiteralPath $migrationRoot) {
  $existing = Get-ChildItem -LiteralPath $migrationRoot -Directory -ErrorAction SilentlyContinue
  if ($existing) {
    throw "Migration history already exists. Use prisma migrate dev for an incremental migration."
  }
}

$migrationParent = Split-Path -Parent $migrationRoot
if (-not (Test-Path -LiteralPath $migrationParent)) {
  throw "Prisma directory was not found: $migrationParent"
}

New-Item -ItemType Directory -Path $migrationDirectory -Force | Out-Null
$migrationFile = Join-Path $migrationDirectory "migration.sql"

npx.cmd prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script -o $migrationFile
Write-Output "Created $migrationFile"
Write-Output "Review the SQL, run it against a clean PostgreSQL database, then commit the migration."
