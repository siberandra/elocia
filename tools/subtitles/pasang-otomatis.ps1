# Memasang tugas Task Scheduler "Elocia Subtitle": pembuatan subtitle berjalan sendiri tanpa jendela
# setiap kali masuk Windows dan setiap jam (melanjutkan yang belum selesai), hanya saat charger tercolok.
# Tugasnya terhapus sendiri setelah semua subtitle lengkap.
# Pemakaian: powershell -ExecutionPolicy Bypass -File tools\subtitles\pasang-otomatis.ps1

$project = (Resolve-Path "$PSScriptRoot\..\..").Path
$pythonw = "$env:LOCALAPPDATA\Elocia\whisper\Scripts\pythonw.exe"
if (-not (Test-Path $pythonw)) { Write-Host "Alat Whisper tidak ada; semua subtitle mungkin sudah selesai."; exit 0 }

$action = New-ScheduledTaskAction -Execute $pythonw -Argument 'tools\subtitles\make_subs.py --cleanup-when-done' -WorkingDirectory $project
$hourly = New-ScheduledTaskTrigger -Once -At (Get-Date).Date.AddMinutes(10) -RepetitionInterval (New-TimeSpan -Hours 1)
$logon = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -ExecutionTimeLimit ([TimeSpan]::Zero) -StartWhenAvailable -Priority 7
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName "Elocia Subtitle" -Action $action -Trigger $logon, $hourly -Settings $settings -Principal $principal -Force | Out-Null
Write-Host "Tugas 'Elocia Subtitle' terpasang: jalan otomatis saat masuk Windows dan tiap jam, hanya saat dicas."
