<#
.SYNOPSIS
  Builds the HealthLOQ Document Hash Generator MSI installer.

.DESCRIPTION
  1. Builds the React client (unless -SkipClientBuild)
  2. Downloads NSSM (Windows service manager) if not cached
  3. Creates a staging directory with production files
  4. Compiles Product.wxs + CustomDialogs.wxs into the MSI

.EXAMPLE
  .\installer\build-msi.ps1
  .\installer\build-msi.ps1 -SkipClientBuild   # client already built
#>
param(
    [switch]$SkipClientBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root      = (Resolve-Path "$PSScriptRoot\..").Path
$wix       = "$env:USERPROFILE\.dotnet\tools\wix.exe"
$uiExt     = "$env:USERPROFILE\.wix\extensions\WixToolset.UI.wixext\4.0.5\wixext4\WixToolset.UI.wixext.dll"
$utilExt   = "$env:USERPROFILE\.wix\extensions\WixToolset.Util.wixext\4.0.5\wixext4\WixToolset.Util.wixext.dll"
$outDir    = "$PSScriptRoot\output"
$staging   = "$PSScriptRoot\staging"
$resources = "$PSScriptRoot\resources"

if (-not (Test-Path $wix)) {
    throw "wix.exe not found. Run: dotnet tool install --global wix --version 4.0.5"
}

# ── Generates AppFiles.wxs from the staging directory ────────────────────────
function New-AppFilesWxs {
    param([string]$StagingDir, [string]$OutputFile)

    $stagingNorm = $StagingDir.TrimEnd('\')
    Write-Host "  Enumerating files..." -ForegroundColor Gray
    $allFiles = Get-ChildItem -Path $stagingNorm -Recurse -File | Sort-Object FullName

    # Collect every directory path that contains files
    $leafDirs = ($allFiles | ForEach-Object {
        $_.DirectoryName.Substring($stagingNorm.Length).TrimStart('\')
    } | Sort-Object -Unique)

    # Expand to include ALL ancestor paths (intermediate dirs with no direct files)
    $allRelDirsSet = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($d in $leafDirs) {
        if (-not $d) { continue }
        $parts = $d -split '\\'
        for ($i = 1; $i -le $parts.Count; $i++) {
            [void]$allRelDirsSet.Add(($parts[0..($i-1)] -join '\'))
        }
    }
    # Sort by depth so parents are always processed before children
    $allRelDirs = @($allRelDirsSet) | Sort-Object { ($_ -split '\\').Count }, { $_ }

    # Assign IDs
    $ctr = 0
    $dirIds = @{ "" = "INSTALLFOLDER" }
    foreach ($d in $allRelDirs) {
        if ($d -and -not $dirIds.ContainsKey($d)) {
            $ctr++; $dirIds[$d] = "D{0:D6}" -f $ctr
        }
    }

    # Build directory XML using XmlDocument (handles nesting correctly)
    $wixNs = "http://wixtoolset.org/schemas/v4/wxs"
    $xml   = [System.Xml.XmlDocument]::new()
    [void]$xml.AppendChild($xml.CreateXmlDeclaration("1.0","UTF-8",$null))

    $wixEl     = $xml.CreateElement("Wix",     $wixNs); [void]$xml.AppendChild($wixEl)
    $fragEl    = $xml.CreateElement("Fragment", $wixNs); [void]$wixEl.AppendChild($fragEl)
    $dirRefEl  = $xml.CreateElement("DirectoryRef", $wixNs)
    $dirRefEl.SetAttribute("Id","INSTALLFOLDER"); [void]$fragEl.AppendChild($dirRefEl)

    # Map relPath -> XmlElement so we can append child dirs
    $dirXmlMap = @{ "" = $dirRefEl }

    foreach ($d in $allRelDirs | Sort-Object { ($_ -split '\\').Count }, { $_ }) {
        if (-not $d) { continue }
        $parent = Split-Path $d -Parent
        $name   = Split-Path $d -Leaf
        $id     = $dirIds[$d]
        $dirEl  = $xml.CreateElement("Directory", $wixNs)
        $dirEl.SetAttribute("Id",   $id)
        $dirEl.SetAttribute("Name", $name)
        [void]$dirXmlMap[$parent].AppendChild($dirEl)
        $dirXmlMap[$d] = $dirEl
    }

    # Component group
    $cgEl = $xml.CreateElement("ComponentGroup", $wixNs)
    $cgEl.SetAttribute("Id", "AppComponents"); [void]$fragEl.AppendChild($cgEl)

    foreach ($file in $allFiles) {
        $relPath = $file.FullName.Substring($stagingNorm.Length + 1)
        $relDir  = $file.DirectoryName.Substring($stagingNorm.Length).TrimStart('\')
        $dirId   = $dirIds[$relDir]

        $compEl = $xml.CreateElement("Component", $wixNs)
        $compEl.SetAttribute("Directory", $dirId)
        $fileEl = $xml.CreateElement("File", $wixNs)
        $fileEl.SetAttribute("Source", "staging\$relPath")
        [void]$compEl.AppendChild($fileEl)
        [void]$cgEl.AppendChild($compEl)
    }

    $xml.Save($OutputFile)
    Write-Host "  AppFiles.wxs generated ($($allFiles.Count) files)" -ForegroundColor Green
}

# ── 1. Build React client ─────────────────────────────────────────────────────
if (-not $SkipClientBuild) {
    Write-Host "`n[1/5] Building React client..." -ForegroundColor Cyan
    Push-Location "$root\client"
    npm install --force
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Client build failed" }
    Pop-Location
} else {
    Write-Host "`n[1/5] Skipping client build (-SkipClientBuild)" -ForegroundColor Yellow
}

# ── 2. Download NSSM ──────────────────────────────────────────────────────────
Write-Host "`n[2/5] Checking NSSM..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $resources | Out-Null
$nssmExe = "$resources\nssm.exe"
if (-not (Test-Path $nssmExe)) {
    Write-Host "  Downloading NSSM 2.24..." -ForegroundColor Gray
    $nssmZip  = "$env:TEMP\nssm-2.24.zip"
    $nssmTemp = "$env:TEMP\nssm-extract"
    Invoke-WebRequest "https://nssm.cc/release/nssm-2.24.zip" -OutFile $nssmZip
    Expand-Archive -Path $nssmZip -DestinationPath $nssmTemp -Force
    Copy-Item "$nssmTemp\nssm-2.24\win64\nssm.exe" $nssmExe
    Remove-Item $nssmZip, $nssmTemp -Recurse -Force
    Write-Host "  NSSM downloaded." -ForegroundColor Green
} else {
    Write-Host "  NSSM already present." -ForegroundColor Green
}

# ── 3. Create staging directory ───────────────────────────────────────────────
Write-Host "`n[3/5] Creating staging directory..." -ForegroundColor Cyan
if (Test-Path $staging) { Remove-Item $staging -Recurse -Force }
New-Item -ItemType Directory -Force -Path $staging | Out-Null

# Directories to exclude from the app root
$excludeDirs  = @(".git", "installer", "scratch", "dist", "client")
$excludeFiles = @(".env", "*.sh", "windows.cmd")

# Copy root-level source files
Get-ChildItem -Path $root -File | Where-Object {
    $name = $_.Name
    -not ($excludeFiles | Where-Object { $name -like $_ })
} | Copy-Item -Destination $staging

# Copy source subdirectories
Get-ChildItem -Path $root -Directory | Where-Object {
    $_.Name -notin $excludeDirs
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination "$staging\$($_.Name)" -Recurse
}

# Copy pre-built React client
if (-not (Test-Path "$root\client\build")) {
    throw "client\build not found - run without -SkipClientBuild first"
}
New-Item -ItemType Directory -Force "$staging\client" | Out-Null
Copy-Item -Path "$root\client\build" -Destination "$staging\client\build" -Recurse

# Copy NSSM and setup scripts into staging root (installed alongside the app)
Copy-Item $nssmExe "$staging\nssm.exe"
Copy-Item "$PSScriptRoot\setup.ps1"     "$staging\setup.ps1"
Copy-Item "$PSScriptRoot\teardown.ps1"  "$staging\teardown.ps1"
Copy-Item "$PSScriptRoot\preflight.ps1" "$staging\preflight.ps1"

Write-Host "  Staging ready: $staging" -ForegroundColor Green

# ── 4. Generate AppFiles.wxs ──────────────────────────────────────────────────
Write-Host "`n[4/5] Generating AppFiles.wxs..." -ForegroundColor Cyan
$appFilesWxs = "$PSScriptRoot\AppFiles.wxs"
New-AppFilesWxs -StagingDir $staging -OutputFile $appFilesWxs

# ── 5. Build MSI ─────────────────────────────────────────────────────────────
Write-Host "`n[5/5] Building MSI..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$msiPath = "$outDir\HealthLOQHashGenerator.msi"

# Base64-encode preflight.ps1 (UTF-16LE) for PowerShell -EncodedCommand.
# This is injected as a WiX preprocessor variable so the script runs as an
# immediate CA before AppSearch, without needing INSTALLFOLDER to exist yet.
$preflightSrc = Get-Content "$PSScriptRoot\preflight.ps1" -Raw -Encoding UTF8
$preflightB64 = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($preflightSrc))
Write-Host "  preflight.ps1 encoded ($($preflightB64.Length) chars)" -ForegroundColor Gray

# Run wix build from the installer directory so relative paths in WXS resolve correctly
Push-Location $PSScriptRoot
& $wix build `
    "Product.wxs" `
    "CustomDialogs.wxs" `
    "AppFiles.wxs" `
    -ext $uiExt `
    -ext $utilExt `
    -out $msiPath `
    -pdbtype none `
    -d "PREFLIGHT_B64=$preflightB64"
$exitCode = $LASTEXITCODE
Pop-Location

if ($exitCode -ne 0) { throw "MSI build failed (exit $exitCode)" }

$sizeMB = [math]::Round((Get-Item $msiPath).Length / 1MB, 1)
Write-Host "`nMSI built successfully: $msiPath ($sizeMB MB)" -ForegroundColor Green
