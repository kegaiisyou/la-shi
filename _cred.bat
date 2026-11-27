@echo off
echo protocol=https> "%TEMP%\gitcred.txt"
echo host=github.com>> "%TEMP%\gitcred.txt"
git credential fill < "%TEMP%\gitcred.txt" > "%TEMP%\gitcredout.txt" 2>"%TEMP%\gitcrederr.txt"
del "%TEMP%\gitcred.txt"
