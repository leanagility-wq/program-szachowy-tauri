param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("arm64-v8a", "x86_64")]
    [string]$Variant,

    [ValidateSet("apk", "aab")]
    [string]$Artifact = "apk"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$srcTauri = Join-Path $repoRoot "src-tauri"
$sourceBinary = Join-Path $srcTauri "resources\engines\android\$Variant\stockfish"
$jniLibsRoot = Join-Path $srcTauri "android-jniLibs"
$variantDir = Join-Path $jniLibsRoot $Variant
$targetBinary = Join-Path $variantDir "libstockfish.so"
$outputDir = Join-Path $repoRoot "build\android-stockfish-variants"
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
Write-Host "Artefakt: $Artifact"
Write-Host "Binarka: $targetBinary"

Push-Location $repoRoot
try {
    if ($Artifact -eq "apk") {
        npm.cmd run android:apk -- --debug
    }
    else {
        npm.cmd run android:aab
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Budowanie Android $Artifact nie powiodlo sie. Kod wyjscia: $LASTEXITCODE"
    }

    $builtArtifact = if ($Artifact -eq "apk") {
        Get-ChildItem -Path (Join-Path $srcTauri "gen\android\app\build\outputs\apk") -Recurse -Filter *.apk |
            Sort-Object LastWriteTimeUtc -Descending |
            Select-Object -First 1
    }
    else {
        Get-ChildItem -Path (Join-Path $srcTauri "gen\android\app\build\outputs\bundle") -Recurse -Filter *.aab |
            Sort-Object LastWriteTimeUtc -Descending |
            Select-Object -First 1
    }

    if (-not $builtArtifact) {
        throw "Nie znaleziono zbudowanego artefaktu Android dla typu '$Artifact'."
    }

    $extension = if ($Artifact -eq "apk") { "apk" } else { "aab" }
    $artifactFlavor = if ($Artifact -eq "apk") { "debug" } else { "release" }
    $namedArtifact = Join-Path $outputDir "app-$artifactFlavor-stockfish-$Variant.$extension"

    Copy-Item $builtArtifact.FullName $namedArtifact -Force
    Write-Host "Gotowy artefakt: $namedArtifact"
}
finally {
    Pop-Location
}
