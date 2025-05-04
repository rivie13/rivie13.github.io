source "https://rubygems.org"

gem "jekyll", "~> 4.4.0"
gem "jekyll-sass-converter", "~> 3.0"

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-seo-tag", "~> 2.7.1"
  gem "jekyll-paginate", "~> 1.1.0"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", ">= 0.1.0", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Required for Jekyll
gem "webrick"

# Add these gems to fix Ruby 3.3 compatibility warnings
gem "csv"
gem "base64"
gem "bigdecimal" 