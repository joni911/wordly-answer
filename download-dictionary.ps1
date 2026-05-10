# Wordle Solver - Setup Script
# Kamus sudah tersedia di data/valid-wordle-words.txt
# Tidak perlu download lagi

$dictPath = Join-Path $PSScriptRoot "data\valid-wordle-words.txt"

if (Test-Path $dictPath) {
    $wordCount = (Get-Content $dictPath | Where-Object { $_ -match '^[a-z]{5}$' }).Count
    Write-Host "Kamus sudah tersedia!" -ForegroundColor Green
    Write-Host "Lokasi: $dictPath" -ForegroundColor Green
    Write-Host "Jumlah kata (5 huruf): $wordCount" -ForegroundColor Green
}
else {
    Write-Host "Kamus tidak ditemukan di $dictPath" -ForegroundColor Red
    Write-Host "Program akan menggunakan kamus fallback." -ForegroundColor Yellow
}
