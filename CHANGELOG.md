# 0.0.1 (2013-07-06)

- node_modules/connect-modrewrite is forced to be v0.2.3 (the latest version is still giving problems with livereload using html5mode)
- Gruntfile.js: uses modrewrite to support livereload with html5 mode enabled
- Grunfile.js: port changed to 9001
- added <title> and metas description+keywords that are going to use the SEO service (still not implemented in the generator). Useful to generate SEO data for each page of the application.
- possibility to choose between Twitter Bootrstrap or Zurb Foundation when running the generator