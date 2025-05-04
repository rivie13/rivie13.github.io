@echo off
echo This script will help fix Jekyll compatibility issues by installing Ruby 3.2
echo.
echo Step 1: Uninstalling Ruby 3.3 (if installed)
echo Please manually uninstall Ruby 3.3 from Control Panel before continuing
echo.
pause
echo.
echo Step 2: Installing Ruby 3.2 with DevKit
echo Downloading RubyInstaller Ruby 3.2...
echo Please open a web browser and download Ruby+Devkit 3.2.2-1 (x64) from:
echo https://rubyinstaller.org/downloads/
echo.
echo After installation, run the following commands in a NEW command prompt:
echo.
echo gem install jekyll -v 4.2.2
echo gem install bundler
echo cd %cd%
echo bundle install
echo bundle exec jekyll serve
echo.
echo Note: You must check "Add Ruby executables to your PATH" during installation
echo.
pause 