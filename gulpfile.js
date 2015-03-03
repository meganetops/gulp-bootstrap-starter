'use strict';

/*
- MEMO -
・ gulp-ruby-sassを最新に。
・ gulp-autoprefixerを最新版に。
・ gulp-minify-cssもついでに最新に。
・ こんな感じでgulp-ruby-sassの最新版でいけるみたい
  https://github.com/sindresorhus/gulp-ruby-sass/tree/rw/1.0
・ テストするときは毎回コンパイルしたファイル・ディレクトリは削除したほうが無難

・->関係なかった[ gulp-autoprefixerの最新版ではgulp-ruby-sassと相性悪くエラーでコンパイルにこける。
  sourcemapがどうのこうの。gulp-ruby-sassでsourcemapをなしにする必要がある。
  https://github.com/sindresorhus/gulp-ruby-sass/issues/130#issuecomment-55579060 ]
*/
var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var fs          = require('fs');
var del         = require('del');
var browsersync = require('browser-sync');
var runSequence = require('run-sequence');
var reload      = browsersync.reload;

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
                        noCache: true,
                        cacheLocation:'./',
                        sourcemap: true
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
var HTMLMIN_OPTIONS  = {
                        empty:true,
                        cdata: true, 
                        comments: true, 
                        conditionals: true, 
                        spare: true, 
                        quotes: true
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
gulp.task('server',['watch'],function(){
  browsersync(BS_OPTIONS);
});
gulp.task('watch',function(){
  gulp.watch( [ASSET_EJS    +'/json/*.json'],['jsony'] );
  gulp.watch( [ASSET_DIR    +'/**/*.ejs'], function(e){
    if(e.type !== "deleted") {
      gulp.start('ejsy');
    }
  });
  gulp.watch( [ASSET_SASS   +'/**/*.scss'], ['sassy',reload] );
  gulp.watch( [ASSET_JS     +'/**/*.js'], ['jsy',reload]);
});
/*
  JSのコピー
*/
gulp.task('jsy',['js_copy'],function(callback){
  console.log('done');
});
/*
  EJS用JSONのコンパイル
*/
gulp.task('jsony',function(){
  return runSequence('ejs_json','ejsy');
  console.log('done');
});
/*
  EJSのコンパイル
*/
gulp.task('ejsy',function(){
  return runSequence('ejs',reload);
  console.log('done');
});
/*
  Sassのコンパイル
*/
gulp.task('sassy',['sass'],function(){
  console.log('done');
});
/*
  画像のサイズ圧縮
*/
gulp.task('img',['imagemin'],function(){
  console.log('done');
});
/*
  distribute
*/
gulp.task('release',function(){
  return runSequence('js_clean','js_copy','css_clean','sassy','img_clean','img','html_clean','ejs_json','ejs');
});
/* ----------------------------------
  tasks
----------------------------------- */
/*
    buildのjsフォルダを削除
*/
gulp.task('js_clean', function (callback) {
    return del(DOCUMENT_ROOT+'/js/**/*',callback);
});
gulp.task('css_clean', function (callback) {
    return del(DOCUMENT_ROOT+'/css/**/*',callback);
});
gulp.task('img_clean', function (callback) {
    return del(DOCUMENT_ROOT+'/**/*.+(jpg|gif|png)',callback);
});
gulp.task('html_clean', function (callback) {
    return del(DOCUMENT_ROOT+'/**/*.html',callback);
});
/*
    buildのjsフォルダにコピー
*/
gulp.task('js_copy',function (callback) {
    // console.log('js_copy');
    return gulp.src(ASSET_JS+'/**/*')
      .pipe(gulp.dest(DOCUMENT_ROOT+'/js'));
});
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
      .pipe($.prettify())
      // .pipe($.minifyHtml(HTMLMIN_OPTIONS))
      .pipe(gulp.dest(DOCUMENT_ROOT));
});
/*
  Sass Compail
*/
gulp.task('sass',function(){
  return $.rubySass(ASSET_SASS+'/style.scss',SASS_ARG)
      .on('error', function (err) { console.log(err.message); })
      .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
      .pipe($.minifyCss({keepBreaks:true,compatibility:'ie8'}))
      .pipe($.sourcemaps.write('./', {
        includeContent: false,
        sourceRoot: ASSET_SASS
      }))
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
  Bootstrap bower_compornents to some folsers
*/
gulp.task('install_strap', ['copy_sass'], function () {
  //sass compile
  // gulp.src(ASSET_SASS+'/bootstrap.scss')
  //     .pipe($.rubySass(SASS_ARG))
  //     .on('error', function (err) { console.log(err.message); })
  //     .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
  //     .pipe($.minifyCss({keepBreaks:true}))
  //     .pipe($.rename('bootstrap.min.css'))
  //     .pipe(gulp.dest(ASSET_DIR+'/css'));
  // $.rubySass(ASSET_SASS+'/utility/bootstrap.scss',SASS_ARG)
  //     .on('error', function (err) { console.log(err.message); })
  //     .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
  //     .pipe($.minifyCss({keepBreaks:true,compatibility:'ie8'}))
  //     .pipe($.rename('bootstrap.min.css'))
  //     .pipe($.sourcemaps.write('./', {
  //       includeContent: false,
  //       sourceRoot: ASSET_SASS
  //     }))
  //     .pipe(gulp.dest(DOCUMENT_ROOT+'/css'));
  //fonts copy
  gulp.src('bower_components/bootstrap-sass-official/assets/fonts/**/*')
    .pipe(gulp.dest(DOCUMENT_ROOT+'/fonts'))
  //images copy
  gulp.src('bower_components/bootstrap-sass-official/assets/images/**/*')
    .pipe(gulp.dest(ASSET_DIR+'/img/bootstrap'))
  //javascript copy
  gulp.src('bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js')
    .pipe($.uglify({ preserveComments: 'all' }))
    .pipe($.rename('bootstrap.min.js'))
    .pipe(gulp.dest(ASSET_DIR+'/js/bootstrap'))
});

gulp.task('copy_sass', function () {
  //scss copy
  return gulp.src('bower_components/bootstrap-sass-official/assets/stylesheets/**/*')
    .pipe(gulp.dest(ASSET_SASS+'/vendor/bootstrap'))
});

gulp.task('bower_default',function(){
  return runSequence('compile_bower','js_copy');
});
gulp.task('compile_bower', function () {
//jquery1.* - for IE8
  gulp.src('bower_components/jquery-legacy/dist/jquery.min.js')
    .pipe($.rename('jquery.legacy.min.js'))
    .pipe(gulp.dest(ASSET_DIR+'/js'))
//jquery2.*
  gulp.src('bower_components/jquery-modern/dist/jquery.min.js')
    .pipe($.rename('jquery.min.js'))
    .pipe(gulp.dest(ASSET_DIR+'/js'))
//modernizr
  gulp.src('bower_components/modernizr/modernizr.js')
      .pipe($.uglify({ preserveComments: 'all' }))
      .pipe($.rename('modernizr.min.js'))
      .pipe(gulp.dest(ASSET_DIR+'/js/lib'));
//selectivizr
  gulp.src('bower_components/selectivizr/selectivizr.js')
      .pipe($.uglify({ preserveComments: 'all' }))
      .pipe($.rename('selectivizr.min.js'))
      .pipe(gulp.dest(ASSET_DIR+'/js/lib'));
//respond 
  gulp.src('bower_components/respond/dest/respond.min.js')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib'));
//jquery-cookie
  gulp.src('bower_components/jquery.cookie/jquery.cookie.js')
      .pipe($.uglify({ preserveComments: 'all' }))
      .pipe($.rename('jquery.cookie.min.js'))
      .pipe(gulp.dest(ASSET_DIR+'/js/lib'));
//magnific-popup
  gulp.src('bower_components/magnific-popup/dist/*')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/magnific-popup'));
//matchHeight 
  gulp.src('bower_components/matchHeight/jquery.matchHeight-min.js')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib'));
//lazyload 
  gulp.src('bower_components/jquery.lazyload/jquery.lazyload.min.js')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib'));
//bxslider
  gulp.src('bower_components/bxslider-4/jquery.bxslider.min.js')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/bxslider'));
//OwlCarousel2
  gulp.src('bower_components/owl-carousel2/dist/owl.carousel.min.js')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/owl-carousel2'));
  gulp.src('bower_components/owl-carousel2/dist/assets/owl.carousel.min.css')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/owl-carousel2'));
  gulp.src('bower_components/owl-carousel2/dist/assets/owl.theme.default.min.css')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/owl-carousel2'));
  gulp.src('bower_components/owl-carousel2/dist/assets/ajax-loader.gif')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/owl-carousel2'));
  gulp.src('bower_components/owl-carousel2/dist/assets/owl.video.play.png')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/owl-carousel2'));
// Slider-pro
  gulp.src('bower_components/slider-pro/dist/js/jquery.sliderPro.min.js')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/slider-pro'));
  gulp.src('bower_components/slider-pro/dist/css/slider-pro.min.css')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/slider-pro'));
  gulp.src('bower_components/slider-pro/dist/css/images/*')
      .pipe(gulp.dest(ASSET_DIR+'/js/lib/slider-pro/images'));
// background-size-polyfill
  gulp.src('bower_components/background-size-polyfill/backgroundsize.min.htc')
      .pipe(gulp.dest(ASSET_DIR+'/'))
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
