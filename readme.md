# AngularJS + SEO generator 

Completely based on the generator made by [Brian Ford](https://github.com/btford).
It's strongly suggested to install [generator-angular](http://travis-ci.org/yeoman/generator-angular), to be always up-to-date with its subgenerators and the great work of his author.
`yo angularseo` should be used instead of `yo angular` just when creating a new/blank project

## Usage
This is still not an npm repository, so download this and run `npm link` to create an alias inside your local nodejs folder.

## What's inside
- node_modules/connect-modrewrite is forced to be v0.2.3 (the latest version is still giving problems with livereload using html5mode)
- Gruntfile.js: uses modrewrite to support livereload with html5 mode enabled
- Grunfile.js: port changed to 9001
- added <title> and metas description+keywords that are going to use the SEO service (still not implemented in the generator). Useful to generate SEO data for each page of the application.
- possibility to choose between Twitter Bootrstrap or Zurb Foundation when running the generator

## Generators
Use Brian Ford's generator to generate controllers, views, routes etc. So, after installing it, simply run for example `yo angular:controller ControllerName`.


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
