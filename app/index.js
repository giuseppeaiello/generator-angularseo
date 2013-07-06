'use strict';
var path = require('path');
var util = require('util');
var spawn = require('child_process').spawn;
var yeoman = require('yeoman-generator');


var Generator = module.exports = function Generator(args, options) {
  yeoman.generators.Base.apply(this, arguments);
  this.argument('appname', { type: String, required: false });
  this.appname = this.appname || path.basename(process.cwd());
  this.indexFile = this.engine(this.read('../../templates/common/index.html'),
      this);

  args = ['main'];

  if (typeof this.env.options.appPath === 'undefined') {
    try {
      this.env.options.appPath = require(path.join(process.cwd(), 'bower.json')).appPath;
    } catch (e) {}
    this.env.options.appPath = this.env.options.appPath || 'app';
  }

  this.appPath = this.env.options.appPath;

  if (typeof this.env.options.coffee === 'undefined') {
    this.option('coffee');

    // attempt to detect if user is using CS or not
    // if cml arg provided, use that; else look for the existence of cs
    if (!this.options.coffee &&
      this.expandFiles(path.join(this.appPath, '/scripts/**/*.coffee'), {}).length > 0) {
      this.options.coffee = true;
    }

    this.env.options.coffee = this.options.coffee;
  }

  if (typeof this.env.options.minsafe === 'undefined') {
    this.option('minsafe');
    this.env.options.minsafe = this.options.minsafe;
    args.push('--minsafe');
  }

  this.hookFor('angular:common', {
    args: args
  });

  this.hookFor('angular:main', {
    args: args
  });

  this.hookFor('angular:controller', {
    args: args
  });

  this.hookFor('karma', {
    as: 'app',
    options: {
      options: {
        coffee: this.options.coffee,
        'skip-install': this.options['skip-install']
       }
    }
  });

  this.on('end', function () {
    this.installDependencies({ skipInstall: this.options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(Generator, yeoman.generators.Base);

Generator.prototype.askForBootstrap = function askForBootstrap() {
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: 'bootstrap',
    message: 'Would you like to include Twitter Bootstrap?',
    default: true
  }, {
    type: 'confirm',
    name: 'compassBootstrap',
    message: 'Would you like to use Twitter Bootstrap for Compass (as opposed to vanilla CSS)?',
    default: true,
    when: function (props) {
      return props.bootstrap;
    }
  }], function (props) {
    this.bootstrap = props.bootstrap;
    this.compassBootstrap = props.compassBootstrap;

    cb();
  }.bind(this));
};

Generator.prototype.askForFoundation = function askForFoundation() {
  var cb = this.async();

  this.prompt([{
    type: 'confirm',
    name: 'foundation',
    message: 'Would you like to include Zurb Foundation?',
    default: false
  }, {
    type: 'confirm',
    name: 'compassFoundation',
    message: 'Would you like to use Zurb Foundation for Compass (as opposed to vanilla CSS)?',
    default: false,
    when: function (props) {
      return props.foundation;
    }
  }], function (props) {
    this.foundation = props.foundation;
    this.compassFoundation = props.compassFoundation;

    cb();
  }.bind(this));
};

Generator.prototype.askForModules = function askForModules() {
  var cb = this.async();

  var prompts = [{
    type: 'confirm',
    name: 'resourceModule',
    message: 'Would you like to include angular-resource.js?',
    default: true
  }, {
    type: 'confirm',
    name: 'cookiesModule',
    message: 'Would you like to include angular-cookies.js?',
    default: true
  }, {
    type: 'confirm',
    name: 'sanitizeModule',
    message: 'Would you like to include angular-sanitize.js?',
    default: true
  }];

  this.prompt(prompts, function (props) {
    this.resourceModule = props.resourceModule;
    this.cookiesModule = props.cookiesModule;
    this.sanitizeModule = props.sanitizeModule;

    cb();
  }.bind(this));
};

// Waiting a more flexible solution for #138
Generator.prototype.bootstrapFiles = function bootstrapFiles() {
  var sassBootstrap = this.compassBootstrap;
  var sassFoundation = this.compassFoundation;
  var sass = sassBootstrap;

  if (this.compassFoundation) { sass = sassFoundation; }

  var files = [];
  var source = 'styles/' + ( sass ? 'scss/' : 'css/' );

  if (sassBootstrap) {
    files.push('main.scss');
  } else if (sassFoundation) {
    files.push('main-foundation.scss');
  } else {
    if (this.bootstrap) {
      files.push('bootstrap.css');
    } else if (this.foundation) {
      files.push('foundation.css');
    }

    files.push('main.css');
  }

  files.forEach(function (file) {
    this.copy(source + file, 'app/styles/' + file);
  }.bind(this));

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'css',
    optimizedPath: 'styles/main.css',
    sourceFileList: files.map(function (file) {
      return 'styles/' + file.replace('.scss', '.css');
    }),
    searchPath: ['.tmp', 'app']
  });
};

Generator.prototype.bootstrapJS = function bootstrapJS() {
  if (this.bootstrap) {
    // Wire Twitter Bootstrap plugins
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      'bower_components/jquery/jquery.js',
      'bower_components/bootstrap-sass/js/bootstrap-affix.js',
      'bower_components/bootstrap-sass/js/bootstrap-alert.js',
      'bower_components/bootstrap-sass/js/bootstrap-dropdown.js',
      'bower_components/bootstrap-sass/js/bootstrap-tooltip.js',
      'bower_components/bootstrap-sass/js/bootstrap-modal.js',
      'bower_components/bootstrap-sass/js/bootstrap-transition.js',
      'bower_components/bootstrap-sass/js/bootstrap-button.js',
      'bower_components/bootstrap-sass/js/bootstrap-popover.js',
      'bower_components/bootstrap-sass/js/bootstrap-typeahead.js',
      'bower_components/bootstrap-sass/js/bootstrap-carousel.js',
      'bower_components/bootstrap-sass/js/bootstrap-scrollspy.js',
      'bower_components/bootstrap-sass/js/bootstrap-collapse.js',
      'bower_components/bootstrap-sass/js/bootstrap-tab.js'
    ]);
  } else if (this.foundation) {
    // Wire Zurb Foundation plugins
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
      'bower_components/jquery/jquery.js',
      'bower_components/foundation/js/foundation/foundation.alerts.js',
      'bower_components/foundation/js/foundation/foundation.clearing.js',
      'bower_components/foundation/js/foundation/foundation.cookie.js',
      'bower_components/foundation/js/foundation/foundation.dropdown.js',
      'bower_components/foundation/js/foundation/foundation.forms.js',
      'bower_components/foundation/js/foundation/foundation.interchange.js',
      'bower_components/foundation/js/foundation/foundation.joyride.js',
      'bower_components/foundation/js/foundation/foundation.js',
      'bower_components/foundation/js/foundation/foundation.magellan.js',
      'bower_components/foundation/js/foundation/foundation.orbit.js',
      'bower_components/foundation/js/foundation/foundation.placeholder.js',
      'bower_components/foundation/js/foundation/foundation.reveal.js',
      'bower_components/foundation/js/foundation/foundation.section.js',
      'bower_components/foundation/js/foundation/foundation.tooltips.js',
      'bower_components/foundation/js/foundation/foundation.topbar.js',
      'bower_components/foundation/js/foundation/index.js',
      'bower_components/foundation/js/vendor/custom.modernizr.js',
      'bower_components/foundation/js/vendor/zepto.js'
    ]);
  }
};

Generator.prototype.extraModules = function extraModules() {
  var modules = [];
  if (this.resourceModule) {
    modules.push('bower_components/angular-resource/angular-resource.js');
  }

  if (this.cookiesModule) {
    modules.push('bower_components/angular-cookies/angular-cookies.js');
  }

  if (this.sanitizeModule) {
    modules.push('bower_components/angular-sanitize/angular-sanitize.js');
  }

  if (modules.length) {
    this.indexFile = this.appendScripts(this.indexFile, 'scripts/modules.js',
        modules);
  }
};

Generator.prototype.createIndexHtml = function createIndexHtml() {
  this.write(path.join(this.appPath, 'index.html'), this.indexFile);
};

Generator.prototype.packageFiles = function () {
  this.template('../../templates/common/_bower.json', 'bower.json');
  this.template('../../templates/common/_package.json', 'package.json');
  this.template('../../templates/common/Gruntfile.js', 'Gruntfile.js');
};
