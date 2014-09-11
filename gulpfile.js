'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browsersync = require('browser-sync');
var reload = browsersync.reload;

var DOCUMENT_ROOT = "html";
var ASSET_IMAGES = "asset/images";
var ASSET_SASS= "asset/sass";
var ASSET_ICON= "asset/icons";
var ASSET_JS= "asset/js";
var AUTOPREFIXER_BROWSERS = ['last 2 version','ie 9','ie 8'];

var SASS_ARG = {
  loadPath: 'asset/sass',
  style: 'expanded',
  noCache: true
};
/* ----------------------------------
  packed task
----------------------------------- */
/*
  画像のサイズ圧縮
*/
gulp.task('img',['imagemin'],function(cb){
  del([ASSET_IMAGES+'/**/*'],cb);
});
/*
  BrowserSync
*/
gulp.task('server',function(){
  browsersync({
    server: {
      baseDir: DOCUMENT_ROOT
    },
    host: "192.168.1.58",
    port: 9000
  });
  gulp.watch([DOCUMENT_ROOT+'/**/*.html'],reload);
  gulp.watch([ASSET_SASS+'/**/*.scss'], ['sassy']);
  gulp.watch([DOCUMENT_ROOT+'/**/*.css'], reload);
});
/*
  Sass compail
*/
gulp.task('sassy',function(){
  return gulp.src([ASSET_SASS+'/**/*.scss','!'+ASSET_SASS+'/bootstrap.scss'])
      .pipe($.rubySass(SASS_ARG))
      .on('error', function (err) { console.log(err.message); })
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe(gulp.dest(DOCUMENT_ROOT));
});

gulp.task('install', ['bower_default','install_strap']);

/* ----------------------------------
  tasks
----------------------------------- */
gulp.task('imagemin', function () {
  return gulp.src(ASSET_IMAGES+'/**/*')
      .pipe($.imagemin())
      .pipe(gulp.dest(DOCUMENT_ROOT+'/img'));
});

// gulp.task('iconfont', function(){
//   gulp.src([ASSET_ICON+'/*.svg'])
//     .pipe($.iconfont({
//       fontName: 'myfont', // required
//       appendCodepoints: true // recommended option
//     }))
//       .on('codepoints', function(codepoints, options) {
//         // CSS templating, e.g.
//         console.log(codepoints, options);
//       })
//     .pipe(gulp.dest(DOCUMENT_ROOT+'/fonts/'));
// });

/*
  Bootstrap bower_compornents to some folsers
*/
gulp.task('install_strap', ['copy_sass'], function () {
  //sass compile
  gulp.src(ASSET_SASS+'/bootstrap.scss')
      .pipe($.rubySass(SASS_ARG))
      .on('error', function (err) { console.log(err.message); })
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe($.minifyCss({keepBreaks:true}))
      .pipe($.rename('bootstrap.min.css'))
      .pipe(gulp.dest(DOCUMENT_ROOT+'/css'));
  //fonts copy
  gulp.src('bower_components/bootstrap-sass-official/assets/fonts/**/*')
    .pipe(gulp.dest(DOCUMENT_ROOT+'/fonts'))
  //images copy
  gulp.src('bower_components/bootstrap-sass-official/assets/images/**/*')
    .pipe(gulp.dest(DOCUMENT_ROOT+'/img/bootstrap'))
  //javascript copy
  gulp.src('bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js')
    .pipe($.uglify({ preserveComments: 'all' }))
    .pipe($.rename('bootstrap.min.js'))
    .pipe(gulp.dest(DOCUMENT_ROOT+'/js/bootstrap'))
});
gulp.task('copy_sass', function () {
  //scss copy
  return gulp.src('bower_components/bootstrap-sass-official/assets/stylesheets/**/*')
    .pipe(gulp.dest(ASSET_SASS+'/vendor/bootstrap'))
});

gulp.task('bower_default', function () {
  //jquery1.* - for IE8
  gulp.src('bower_components/jquery-legacy/dist/jquery.min.js')
    .pipe($.rename('jquery.legacy.min.js'))
    .pipe(gulp.dest(DOCUMENT_ROOT+'/js'))
  //jquery2.*
  gulp.src('bower_components/jquery-modern/dist/jquery.min.js')
    .pipe($.rename('jquery.min.js'))
    .pipe(gulp.dest(DOCUMENT_ROOT+'/js'))
  //modernizr
  gulp.src('bower_components/modernizr/modernizr.js')
      .pipe($.uglify({ preserveComments: 'all' }))
      .pipe($.rename('modernizr.min.js'))
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib'));
  //selectivizr
  gulp.src('bower_components/selectivizr/selectivizr.js')
      .pipe($.uglify({ preserveComments: 'all' }))
      .pipe($.rename('selectivizr.min.js'))
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib'));
  //respond 
  gulp.src('bower_components/respond/dest/respond.min.js')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib'));
  //jquery-cookie
  gulp.src('bower_components/jquery.cookie/jquery.cookie.js')
      .pipe($.uglify({ preserveComments: 'all' }))
      .pipe($.rename('jquery.cookie.min.js'))
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib'));
  //magnific-popup
  gulp.src('bower_components/magnific-popup/dist/*')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/magnific-popup'));
  //matchHeight 
  gulp.src('bower_components/matchHeight/jquery.matchHeight-min.js')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib'));
  //bxslider
  gulp.src('bower_components/bxslider-4/jquery.bxslider.min.js')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/bxslider'));
  gulp.src('bower_components/bxslider-4/jquery.bxslider.css')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/bxslider'));
});

/* ----------------------------------
  methods
----------------------------------- */
/*
  関数を遅延実行（deferred）するオブジェクト
    -- untilで指定したeventを全て待ち合わせてからexecで指定した関数を実行する。
  http://qiita.com/morou/items/d54000396a2a7d0714de
*/
var Defer = function() {
  var max = 0, count = 0, callback = null;
  function onEventEnd() {
    if (max === ++count) {
      callback && callback();
    }
  }
  this.until = function(ev) {
    max++;
    ev.on('end', onEventEnd);
  };
  this.exec = function(cb) {
    callback = cb;
  };
};
