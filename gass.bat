@echo off
setlocal enabledelayedexpansion

:: Buat nomor acak 4 digit
set /a randnum=%random% %% 9000 + 1000

:: Jalankan urutan perintah git
git add .
git commit -m "perubahan !randnum!"
git push -u origin main

echo.
echo ===== PUSH SELESAI =====
echo Commit: perubahan !randnum!
pause