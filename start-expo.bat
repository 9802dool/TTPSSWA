@echo off
title TTPSSWA Expo
cd /d "%~dp0mobile"
echo Starting Expo — keep this window OPEN while you use Expo Go on your phone.
echo.
call npx expo start
pause
