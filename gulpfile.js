'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var fs = require('fs');
var del = require('del');
var browsersync = require('browser-sync');
var reload = browsersync.reload;

var AUTOPREFIXER_BROWSERS = ['last 2 version','ie 9','ie 8'];
var DOCUMENT_ROOT    = "build";
var ASSET_DIR        = "src";
var ASSET_IMAGES     = ASSET_DIR;
var ASSET_SASS       = "src/sass";
var ASSET_EJS        = "src/ejs";
var ASSET_ICON       = "src/icons";
var ASSET_JS         = "src/js";
var SASS_ARG         = {
                      loadPath: 'src/sass',
                      style: 'expanded',
                      noCache: true
                    };
var MY_IP            = "192.168.*.**";
var SERVER_PORT      = 9000;
var SERVER_STARTPATH = '/index.html';
var SERVER_PROXY     = 'hoge.localhost';
var BS_OPTIONS       = {
                        server: {
                          baseDir: DOCUMENT_ROOT
                        },
                        // host: MY_IP,
                        // port: SERVER_PORT,
                        startPath: SERVER_STARTPATH
                        // proxy: SERVER_PROXY
                      };
/* ----------------------------------
  packed task
----------------------------------- */
/*
  SRATKIT INSTALL
*/
gulp.task('install', ['bower_default','install_strap']);
/*
  BrowserSync & WATCH
*/
gulp.task('server',function(){
  browsersync(BS_OPTIONS);
  gulp.watch( [ASSET_EJS+'/json/*.json'],['jsony'] );
  gulp.watch( [ASSET_DIR+'/**/*.ejs'],['ejsy'] );
  gulp.watch( [ASSET_SASS+'/**/*.scss'], ['sassy'] );
  gulp.watch( [DOCUMENT_ROOT+'/**/*.html'],reload );
  gulp.watch( [DOCUMENT_ROOT+'/**/*.css'], reload );
  gulp.watch( [ASSET_IMAGES+'/**/*.+(jpg|gif|png)'], ['img'] );
});
/*
  EJS用JSONのコンパイル
*/
gulp.task('jsony',['ejs_json'],function(){
  // ejs_jsonタスク終了時に何かしたければこちらへ?
  return gulp.run(['ejsy']);
  console.log('done');
});
/*
  EJSのコンパイル
*/
gulp.task('ejsy',['ejs'],function(){
  // ejsタスク終了時に何かしたければこちらへ?
  console.log('done');
});
/*
  Sassのコンパイル
*/
gulp.task('sassy',['sass'],function(){
  // sassタスク終了時に何かしたければこちらへ?
  console.log('done');
});
/*
  画像のサイズ圧縮
*/
gulp.task('img',['imagemin'],function(){
  // imageminタスク終了時に何かしたければこちらへ?
  // del([ASSET_IMAGES+'/**/*.(jpg|gif|png)'],cb);
  console.log('done');
});
/*
  distribute
*/
gulp.task('release',function(){
  console.log('done');
});
/* ----------------------------------
  tasks
----------------------------------- */
/*
    EJS用JSONファイルを結合
*/
gulp.task('ejs_json', function (callback) {
    return gulp.src(ASSET_EJS+'/json/*.json')
        .pipe($.extend('site.json'))
        .on('error', function (err) { console.log(err.message); })
        .pipe(gulp.dest(ASSET_EJS));
});
/*
    EJSでHTMLファイルを生成
*/
gulp.task('ejs', function (e) {
  var json = JSON.parse(fs.readFileSync(ASSET_EJS+"/site.json"));
  return gulp.src( [ASSET_DIR+"/**/*.ejs",'!'+ASSET_EJS+"/**/*.ejs"] )
      .pipe($.ejs(json))
      .on('error', function (err) { console.log(err.message); })
      .pipe(gulp.dest(DOCUMENT_ROOT));
});
/*
  Sass Compail
*/
gulp.task('sass',function(){
  return gulp.src([ASSET_SASS+'/**/*.scss','!'+ASSET_SASS+'/bootstrap.scss'])
      .pipe($.rubySass(SASS_ARG))
      .on('error', function (err) { console.log(err.message); })
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe(gulp.dest(DOCUMENT_ROOT+'/css'));
});
/*
  Images Mininy
*/
gulp.task('imagemin', function (fn) {
  return gulp.src(ASSET_IMAGES+'/**/*.+(jpg|gif|png)')
      .pipe($.imagemin())
      .pipe(gulp.dest(DOCUMENT_ROOT));
});
/*
  icon Font
*/
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
//lazyload 
  gulp.src('bower_components/jquery.lazyload/jquery.lazyload.min.js')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib'));
//bxslider
  gulp.src('bower_components/bxslider-4/jquery.bxslider.min.js')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/bxslider'));
//OwlCarousel2
  gulp.src('bower_components/owl-carousel2/dist/owl.carousel.min.js')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/owl-carousel2'));
  gulp.src('bower_components/owl-carousel2/dist/assets/owl.carousel.min.css')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/owl-carousel2'));
  gulp.src('bower_components/owl-carousel2/dist/assets/owl.theme.default.min.css')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/owl-carousel2'));
  gulp.src('bower_components/owl-carousel2/dist/assets/ajax-loader.gif')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/owl-carousel2'));
  gulp.src('bower_components/owl-carousel2/dist/assets/owl.video.play.png')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/owl-carousel2'));
// Slider-pro
  gulp.src('bower_components/slider-pro/dist/js/jquery.sliderPro.min.js')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/slider-pro'));
  gulp.src('bower_components/slider-pro/dist/css/slider-pro.min.css')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/slider-pro'));
  gulp.src('bower_components/slider-pro/dist/css/images/*')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js/lib/slider-pro/images'));
// background-size-polyfill
  gulp.src('bower_components/background-size-polyfill/backgroundsize.min.htc')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/'));
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
