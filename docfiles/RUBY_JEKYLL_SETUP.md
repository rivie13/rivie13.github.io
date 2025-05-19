---
layout: null
published: false
---

# Ruby and Jekyll Setup Guide for Windows

## Table of Contents

1. [Installing Ruby on Windows](#installing-ruby-on-windows)
2. [Setting Ruby in PATH](#setting-ruby-in-path)
3. [Installing Jekyll and Bundler](#installing-jekyll-and-bundler)
4. [Setting Up Your Jekyll Site](#setting-up-your-jekyll-site)
5. [Running Your Jekyll Site Locally](#running-your-jekyll-site-locally)
6. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)

## Installing Ruby on Windows

Ruby is the programming language that Jekyll is built on. To install Ruby on Windows:

1. Download the RubyInstaller from [RubyInstaller.org](https://rubyinstaller.org/downloads/)
   - Choose the **Ruby+Devkit** version (recommended: Ruby+Devkit 3.4.x (x64))
   - The DevKit is necessary for building native extensions for certain gems

2. Run the installer and follow these steps:
   - Accept the license agreement
   - Keep the default installation location (typically `C:\Ruby34-x64\`)
   - Check "Add Ruby executables to your PATH"
   - Check "MSYS2 development toolchain"
   - Complete the installation

3. At the end of the installation, when the "Run 'ridk install'" prompt appears:
   - Leave the checkbox checked
   - When the MSYS2 installation window opens, press Enter to install all components (1, 2, and 3)
   - This installs the development toolchain needed for Jekyll

4. **Restart your computer** after installation to ensure PATH changes take effect

## Setting Ruby in PATH

### Checking If Ruby Is In Your PATH

To check if Ruby is in your PATH environment variable:

```
ruby -v
```

If you see a Ruby version, Ruby is properly set in your PATH.

### Temporarily Adding Ruby to PATH (Current Session Only)

If Ruby is not in your PATH for the current session:

```
set PATH=C:\Ruby34-x64\bin;%PATH%
```

This only affects the current command prompt session.

### Permanently Adding Ruby to PATH

To permanently add Ruby to your PATH:

1. Right-click on the Windows Start button and select "System"
2. Click on "Advanced system settings" on the right side
3. Click the "Environment Variables" button
4. In the "System variables" section, find and select the "Path" variable
5. Click "Edit"
6. Click "New" and add the path to your Ruby installation's bin directory (e.g., `C:\Ruby34-x64\bin`)
7. Click "OK" on all windows to save
8. Restart any open command prompts for changes to take effect

## Installing Jekyll and Bundler

After installing Ruby, you need to install Jekyll and Bundler gems:

1. Open a command prompt
2. Install Bundler:
   ```
   gem install bundler
   ```

3. Install Jekyll:
   ```
   gem install jekyll
   ```

4. Verify Jekyll installation:
   ```
   jekyll -v
   ```

   Note: If you get dependency errors at this step, don't worry. This is normal and will be resolved when you run `bundle install` in your project directory.

## Setting Up Your Jekyll Site

### Using an Existing Jekyll Site

If you have an existing Jekyll site (like your GitHub Pages repository):

1. Navigate to your project directory:
   ```
   cd C:\path\to\your\site
   ```

2. Install dependencies specified in the Gemfile:
   ```
   bundle install
   ```

### Creating a New Jekyll Site

To create a new Jekyll site:

1. Navigate to where you want to create the site:
   ```
   cd C:\path\to\parent\directory
   ```

2. Create a new Jekyll site:
   ```
   jekyll new my-site-name
   ```

3. Navigate to the new site:
   ```
   cd my-site-name
   ```

4. Install dependencies:
   ```
   bundle install
   ```

## Running Your Jekyll Site Locally

To run your Jekyll site locally and preview it:

1. Navigate to your site's directory
2. Run the Jekyll server:
   ```
   bundle exec jekyll serve
   ```

3. Open a browser and go to [http://localhost:4000](http://localhost:4000)

To stop the server, press `Ctrl+C` in the command prompt.

## Common Issues and Troubleshooting

### Ruby Not Found After Installation

**Issue**: `'ruby' is not recognized as an internal or external command`

**Solutions**:
- Restart your computer after installing Ruby
- Manually add Ruby to your PATH as described in the [Setting Ruby in PATH](#setting-ruby-in-path) section
- Verify the Ruby installation directory exists (e.g., `C:\Ruby34-x64\`)

### Jekyll-Sass-Converter Version Conflict

**Issue**: `You have already activated jekyll-sass-converter 3.1.0, but your Gemfile requires jekyll-sass-converter 2.2.0`

**Solutions**:
1. Add `bundle exec` before any Jekyll commands:
   cmd prompt:
   ```
   bundle exec jekyll -v
   bundle exec jekyll serve # this is to run the server/start the site locally
   ```

2. Update your Gemfile to explicitly use the newer version:
   ```ruby
   # In your Gemfile, add:
   gem "jekyll-sass-converter", "~> 3.0"
   ```
   
   Then run:
   ```
   bundle update
   ```

### WDM Gem Installation Error

**Issue**: `An error occurred while installing wdm (0.1.1), and Bundler cannot continue.`

**Solutions**:
1. Update your Gemfile to specify a different version:
   ```ruby
   # In your Gemfile, change:
   gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
   
   # To:
   gem "wdm", ">= 0.1.0", :platforms => [:mingw, :x64_mingw, :mswin]
   ```

2. If that doesn't work, you can exclude wdm and use an alternative:
   ```ruby
   # In your Gemfile, replace wdm with:
   gem 'eventmachine', '1.2.7', github: 'eventmachine/eventmachine', tag: 'v1.2.7'
   ```

3. Another approach is to run:
   ```
   gem install wdm --platform=ruby
   ```
   And then try `bundle install` again

### Bundle Install Fails with SSL Errors

**Issue**: SSL certificate verification errors during bundle install

**Solution**:
```
gem sources -r https://rubygems.org/
gem sources -a http://rubygems.org/
bundle install
```

### Jekyll Serve Command Not Working

**Issue**: `bundle exec jekyll serve` fails to start server

**Solutions**:
1. Make sure all dependencies are installed:
   ```
   bundle install
   ```

2. Try updating bundler:
   ```
   gem update bundler
   bundle update
   ```

3. If getting port conflicts, specify a different port:
   ```
   bundle exec jekyll serve --port 4001
   ```

### "Could not find gem" Errors

**Issue**: `Could not find gem 'X' in locally installed gems`

**Solutions**:
1. Make sure your Gemfile has the required gem
2. Run `bundle install` to install missing gems
3. If still having issues, try cleaning bundler:
   ```
   gem uninstall bundler
   gem install bundler
   bundle install
   ```

### Checking for Ruby Environment Information

To get more information about your Ruby setup for troubleshooting:

```
ruby -v           # Ruby version
gem -v            # Gem version
bundle -v         # Bundler version
gem list          # List installed gems
bundle show       # List gems used by your project
```

## Jekyll Site Structure

For reference, a basic Jekyll site includes these key files and directories:

- `_config.yml` - Site configuration
- `_layouts/` - Templates for pages
- `_includes/` - Reusable components
- `_posts/` - Blog posts (format: YYYY-MM-DD-title.md)
- `assets/` - CSS, JavaScript, images
- `_site/` - Generated site (don't edit these files directly)
- `Gemfile` - Ruby dependencies
- `index.md` or `index.html` - Main page

Understanding this structure helps with troubleshooting and site development. 