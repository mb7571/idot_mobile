@echo off
echo Setting up iDOT development environment...
echo.

set JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot
set ANDROID_HOME=C:\Users\LapCare\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
echo.

echo Verifying installations:
java -version
echo.
adb --version
echo.

echo Environment ready! You can now run:
echo   npm start
echo   npm run android
echo.
