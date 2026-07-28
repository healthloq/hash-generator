#
# Runs as an immediate (non-elevated) custom action before AppSearch in the
# InstallUISequence.  Results are written to HKCU so RegistrySearch can
# populate MSI properties before any dialog is shown.
#
$regBase = "HKCU:\Software\HealthLOQ\HashGenerator\Preflight"
New-Item -Path $regBase -Force | Out-Null

function Set-Check { param([string]$Name, [bool]$Pass)
    $text = if ($Pass) { "[  OK  ]" } else { "[ FAIL ]" }
    Set-ItemProperty -Path $regBase -Name $Name -Value $text -Type String
}

# 1. Node.js v18+
try {
    $ok  = $false
    $n   = Get-Command node.exe -ErrorAction SilentlyContinue
    if (-not $n) {
        foreach ($p in @("$env:ProgramFiles\nodejs\node.exe","C:\Program Files\nodejs\node.exe")) {
            if (Test-Path $p) { $n = [PSCustomObject]@{Source=$p}; break }
        }
    }
    if ($n) {
        $ver   = & $n.Source --version 2>$null
        $major = [int]($ver -replace '^v(\d+)\..*','$1')
        $ok    = ($major -ge 18)
    }
    Set-Check "NodeOK" $ok
} catch { Set-Check "NodeOK" $false }

# 2. Port 8003 not in use
try {
    $inUse = netstat -an 2>$null | Select-String "[:.]8003 "
    Set-Check "PortOK" (-not $inUse)
} catch { Set-Check "PortOK" $false }

# 3. Outbound HTTPS to api.healthloq.com (5-second TCP timeout)
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $ar  = $tcp.BeginConnect("api.healthloq.com", 443, $null, $null)
    $ok  = $ar.AsyncWaitHandle.WaitOne(5000, $false)
    try { $tcp.Close() } catch {}
    Set-Check "NetworkOK" $ok
} catch { Set-Check "NetworkOK" $false }

# 4. Free disk space >= 500 MB on the system drive
try {
    $letter = $env:SystemDrive.TrimEnd(':')
    $drive  = Get-PSDrive -Name $letter -ErrorAction SilentlyContinue
    Set-Check "DiskOK" ($drive -and ($drive.Free / 1MB) -ge 500)
} catch { Set-Check "DiskOK" $false }

# 5. Windows 10 / Server 2016 or newer (OS build >= 14393)
try {
    $build = [int](Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion").CurrentBuild
    Set-Check "WindowsOK" ($build -ge 14393)
} catch { Set-Check "WindowsOK" $false }
