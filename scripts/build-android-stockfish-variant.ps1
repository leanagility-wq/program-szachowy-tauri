param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("arm64-v8a", "x86_64")]
    [string]$Variant
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$srcTauri = Join-Path $repoRoot "src-tauri"
$sourceBinary = Join-Path $srcTauri "resources\engines\android\$Variant\stockfish"
$jniLibsRoot = Join-Path $srcTauri "android-jniLibs"
$variantDir = Join-Path $jniLibsRoot $Variant
$targetBinary = Join-Path $variantDir "libstockfish.so"
$outputDir = Join-Path $repoRoot "build\android-stockfish-variants"
$builtApk = Join-Path $srcTauri "gen\android\app\build\outputs\apk\universal\debug\app-universal-debug.apk"
$namedApk = Join-Path $outputDir "app-universal-debug-stockfish-$Variant.apk"
$generatedEngineAssets = Join-Path $srcTauri "gen\android\app\src\main\assets\resources\engines"

if (-not (Test-Path $sourceBinary)) {
    throw "Nie znaleziono binarki Stockfish dla wariantu '$Variant': $sourceBinary"
}

New-Item -ItemType Directory -Force $variantDir | Out-Null
New-Item -ItemType Directory -Force $outputDir | Out-Null

# Ensure the APK differs only by the selected Stockfish binary.
Get-ChildItem -Path $jniLibsRoot -Recurse -Filter libstockfish.so -ErrorAction SilentlyContinue |
    Remove-Item -Force

if (Test-Path $generatedEngineAssets) {
    Remove-Item -Recurse -Force $generatedEngineAssets
}

Copy-Item $sourceBinary $targetBinary -Force

Write-Host "Przygotowano wariant Stockfish: $Variant"
Write-Host "Binarka: $targetBinary"

Push-Location $repoRoot
try {
    npm.cmd run android:apk -- --debug
    if ($LASTEXITCODE -ne 0) {
        throw "Budowanie Android APK nie powiodlo sie. Kod wyjscia: $LASTEXITCODE"
    }

    if (-not (Test-Path $builtApk)) {
        throw "Nie znaleziono zbudowanego APK: $builtApk"
    }

    Copy-Item $builtApk $namedApk -Force
    Write-Host "Gotowy APK: $namedApk"
}
finally {
    Pop-Location
}
