<#
  Called as a deferred WiX custom action (elevated) after InstallFiles.
  Config values are passed as named parameters (WiX formats [PROPERTY] refs
  in ExeCommand at schedule time). InstallDir is derived from $PSScriptRoot
  to avoid the trailing-backslash / quote-escaping bug in Windows arg parsing.
#>
param(
    [string]$Port        = "8003",
    [string]$DocsFolder  = "C:\HealthLOQ Documents",
    [string]$JwtToken    = "",
    [string]$AlertEmail  = ""
)

$logDir = "C:\ProgramData\HealthLOQ"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = "$logDir\hloq-setup.log"

function Log($msg) {
    $ts = Get-Date -Format "HH:mm:ss"
    "$ts  $msg" | Out-File -FilePath $log -Append -Encoding UTF8
}

try {
    Log "setup.ps1 started"

    # Derive install dir from script location (avoids trailing-backslash arg-parse bug)
    $installDir = $PSScriptRoot.TrimEnd('\') + '\'
    # ExeCommand pads a trailing space before the closing quote to prevent the
    # \"  Windows arg-parse bug (path ends with \).  Trim whitespace first,
    # then strip any residual trailing backslash.
    $DocsFolder = $DocsFolder.Trim().TrimEnd('\')

    Log "InstallDir  = $installDir"
    Log "Port        = $Port"
    Log "DocsFolder  = $DocsFolder"
    Log "AlertEmail  = $AlertEmail"

    if (-not $installDir -or $installDir -eq '\') {
        throw "PSScriptRoot is empty - cannot determine install directory."
    }

    # Write .env file
    $envContent = @"
PORT=$Port
ROOT_FOLDER_PATH=$DocsFolder
REACT_APP_API_BASE_URL=http://localhost:$Port
REACT_APP_JWT_TOKEN=$JwtToken
REACT_APP_HEALTHLOQ_API_BASE_URL=https://api.healthloq.com
REACT_APP_HEALTHLOQ_ORGANIZATION_APP_BASE_URL=https://partner.healthloq.com
REACT_APP_HEALTHLOQ_CONSUMER_APP_BASE_URL=https://www.healthloq.com
ALERT_EMAIL=$AlertEmail
"@

    Set-Content -Path "${installDir}.env" -Value $envContent -Encoding UTF8
    Log ".env written"

    # Create documents folder
    if (-not (Test-Path $DocsFolder)) {
        New-Item -ItemType Directory -Force -Path $DocsFolder | Out-Null
        Log "Created documents folder: $DocsFolder"
    }

    # Find node.exe (PS5.1 compatible - no ?. operator)
    $nodeCmd = Get-Command node.exe -ErrorAction SilentlyContinue
    $nodeExe = if ($nodeCmd) { $nodeCmd.Source } else { $null }
    if (-not $nodeExe) {
        foreach ($candidate in @(
            "$env:ProgramFiles\nodejs\node.exe",
            "$env:LOCALAPPDATA\Programs\nodejs\node.exe",
            "C:\Program Files\nodejs\node.exe"
        )) {
            if (Test-Path $candidate) { $nodeExe = $candidate; break }
        }
    }
    if (-not $nodeExe) { throw "node.exe not found. Install Node.js and reinstall." }
    Log "node.exe = $nodeExe"

    # Configure NSSM Windows service
    $nssm        = "${installDir}nssm.exe"
    $serviceName = "HealthLOQHashGenerator"

    Log "Stopping/removing existing service..."
    & $nssm stop   $serviceName 2>$null
    & $nssm remove $serviceName confirm 2>$null
    Start-Sleep -Seconds 2

    Log "Installing service..."
    & $nssm install $serviceName $nodeExe
    & $nssm set $serviceName AppParameters "--max-old-space-size=8192 --expose-gc healthloqdocverify.js"
    & $nssm set $serviceName AppDirectory  ($installDir.TrimEnd('\'))
    & $nssm set $serviceName DisplayName   "HealthLOQ Document Hash Generator"
    & $nssm set $serviceName Description   "Watches and hashes documents for HealthLOQ verification"
    & $nssm set $serviceName Start         SERVICE_AUTO_START

    Log "Starting service..."
    & $nssm start $serviceName
    Log "Done."

} catch {
    Log "ERROR: $_"
    throw
}
