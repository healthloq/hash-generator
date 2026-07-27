<#
  Called as a deferred WiX custom action (elevated) during uninstall.
  Stops and removes the NSSM Windows service.
  InstallDir is derived from $PSScriptRoot to avoid trailing-backslash arg-parse issues.
#>

$ErrorActionPreference = "SilentlyContinue"
$serviceName = "HealthLOQHashGenerator"
$nssm        = "$PSScriptRoot\nssm.exe"

if (Test-Path $nssm) {
    & $nssm stop   $serviceName
    Start-Sleep -Seconds 2
    & $nssm remove $serviceName confirm
} else {
    Stop-Service  -Name $serviceName -Force
    sc.exe delete $serviceName
}
