const gulp = require("gulp"),
  sass = require("gulp-sass"),
  csscomb = require('gulp-csscomb'), //причесывает стили
  csso = require('gulp-csso'), //чистит css от дублированного кода
  autoprefixer = require("gulp-autoprefixer"), //префиксы для старых браухеров -webkit- -moz- -o-
  sourcemaps = require('gulp-sourcemaps'), //добавляет свой код по которому отслеживает нужно ли перезаписывать css файл
  
  concat = require('gulp-concat'), //обьеденение файлов с одинаковым расширением
  uglify = require('gulp-uglify-es').default, //js.min
  
  rename = require('gulp-rename'), //переименование файлов
  del = require("del"), //удаление файлов и папок
  
  imagemin = require('gulp-imagemin'), //сжимает размер картинок
  responsive = require('gulp-responsive-images'), //картинки разных размеров (для работы нужно поставить программу graphicsmagick)
  imageminJpegRecompress = require('imagemin-jpeg-recompress'),
  pngquant = require('imagemin-pngquant'),
  
  ngrok = require('ngrok'),
  browserSync = require("browser-sync").create(); // Browser Sync для перезагрузки страницы

const PROJECT_FOLDERS = {
  START: "./draft/",
  PUBLIC: "./public/"
};

const PATH = {
  styleInput: PROJECT_FOLDERS.START + "sass/**/*.{scss,sass}",
  styleOutput: PROJECT_FOLDERS.PUBLIC + "css/",
  
  scriptPolyfill: [
    './node_modules/html5shiv/dist/html5shiv.min.js', //html5 теги header footer
    './node_modules/svg4everybody/dist/svg4everybody.min.js', //svg
    './node_modules/respond/main.js', //media запросы
    PROJECT_FOLDERS.START + "_libs/validate-master/dist/validate.polyfills.js",
    // './node_modules/picturefill/dist/picturefill.min.js' //тег picture если его использовали для разметки
  ], //поддержка старыми браузерами
  scriptLibs: [
    PROJECT_FOLDERS.START + "_libs/jquery/dist/jquery.min.js",
    PROJECT_FOLDERS.START + "_libs/validate-master/dist/validate.min.js", //https://github.com/cferdinandi/validate
    PROJECT_FOLDERS.START + "_libs/wow/dist/wow.min.js" //https://wowjs.uk/
  ], //подключаем свои библиотеки
  scriptInput: [
    PROJECT_FOLDERS.START + "js/**/*.js"
  ], //свои скрипты
  scriptOutput: PROJECT_FOLDERS.PUBLIC + "js/",
  
  fontInput: PROJECT_FOLDERS.START + "fonts/**/*.*",
  fontOutput:  PROJECT_FOLDERS.PUBLIC + "fonts/",
  
  templateInput: PROJECT_FOLDERS.START + "*.html",
  templateOutput:  PROJECT_FOLDERS.PUBLIC,
  
  clearFolder:  PROJECT_FOLDERS.PUBLIC,
  
  imageInput: [
    PROJECT_FOLDERS.START + "image/**/*.{png,jpg,jpeg,gif,svg}",
    "!" + PROJECT_FOLDERS.START + "image/responsive/**/*"
  ],
  imageOutput:  PROJECT_FOLDERS.PUBLIC + "image/",
  faviconInput: PROJECT_FOLDERS.START + "image/favicon/**/*",
  faviconOutput:  PROJECT_FOLDERS.PUBLIC + "image/favicon/",
  imageResponsiveInput: PROJECT_FOLDERS.START + "image/responsive/**/*.{gif,jpg,jpeg,png}",
  imageResponsiveOutput:  PROJECT_FOLDERS.PUBLIC + "image/responsive/"
};

/********************************* styles *************************************/

function style() { //только sass
  return gulp.src(PATH.styleInput)
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(autoprefixer('last 15 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1')) //префиксы для старых браузеров
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(PATH.styleOutput))
    .pipe(browserSync.stream()); //для живого обновления страницы через плагин browser-sync
}

function styleProd() { //причесаный и с префикасами
  return gulp.src(PATH.styleInput)
    .pipe(sass())
    .pipe(csscomb())
    .pipe(autoprefixer('last 15 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1')) //префиксы для старых браузеров
    .pipe(gulp.dest(PATH.styleOutput))
    .pipe(csso())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(PATH.styleOutput))
}


/********************************* js *************************************/

function polyfillJS () {
  return gulp.src(PATH.scriptPolyfill)
    .pipe(concat('polyfill.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(PATH.scriptOutput));
};

function libsJS () {
  return gulp.src(PATH.scriptLibs)
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(PATH.scriptOutput));
};

function script () {
  return gulp.src(PATH.scriptInput)
    .pipe(concat('script.js')) //обьеденення версия файлов JS
    .pipe(gulp.dest(PATH.scriptOutput))
};

function minJs () {
  return gulp.src([
      '!./public/js/polyfill.min.js',
      './public/js/libs.min.js',
      './public/js/script.js'
    ])
    .pipe(concat('script.min.js')) //обьеденення версия файлов JS
    .pipe(uglify()) //сжатие
    .pipe(gulp.dest(PATH.scriptOutput)); //сохраняем
};


/********************************* fonts *************************************/
function fonts() { //копирование шрифтов с папки в папку без обработки
  return gulp.src(PATH.fontInput)
    .pipe(gulp.dest(PATH.fontOutput));
};

/********************************* html *************************************/
function template() { //копирование шрифтов с папки в папку без обработки
  return gulp.src(PATH.templateInput)
    .pipe(gulp.dest(PATH.templateOutput));
};

/********************************* images *************************************/
function clean() {
  return del(PATH.clearFolder) //удалить все файлы внутри папки
}

/********************************* images *************************************/

function favicon() { //просто перенос картинок без обработки
  return gulp.src(PATH.faviconInput)
    .pipe(gulp.dest(PATH.faviconOutput));
}

function imageMin() { //уменьшает размер картинок Kb
  return gulp.src(PATH.imageInput) //берет картинки с этой папки
    .pipe((imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.jpegtran({ progressive: true }),
      imageminJpegRecompress({
        loops: 5,
        min: 70,
        max: 75,
        quality: 'medium'
      }),
      imagemin.svgo(),
      imagemin.optipng({ optimizationLevel: 3 }),
      pngquant()
    ], {
      verbose: true
    }))) //сжимает картинки
    .pipe(gulp.dest(PATH.imageOutput)); //кладет сжатые картинки сюда
};

function imageResponsive () { //создлает миниатюры изображений
  return gulp.src(PATH.imageResponsiveInput)
    .pipe(responsive({ '**/*': [
        {
         /* quality: 70,
          crop: 'center',
          width: 1920,
          height: 320,
          rename: { suffix: '-miniature' } //приствка к сгенерированным изобржениям
        }, {*/
          quality: 70,
          width: 1400,
          rename: { suffix: '-1280' }
        }, {
          quality: 70,
          width: 760,
          rename: { suffix: '-640' }
        }, {
          quality: 70,
          width: 500,
          rename: { suffix: '-480' }
        }
      ]}))
    .pipe(gulp.dest(PATH.imageResponsiveOutput)); //куда сохраняем миниатюры
};

/*********************************** server ***********************************/

function watch() {
  browserSync.init({ // Выполняем browserSync
    server: { // Определяем параметры сервера
      baseDir:  PROJECT_FOLDERS.PUBLIC // Директория для сервера - app
    },
    notify: false // Отключаем уведомления в браузере
  });
  
  gulp.watch(PATH.styleInput, style);
  gulp.watch(PATH.scriptInput, script).on('change', browserSync.reload);
  gulp.watch(PATH.templateInput, template).on('change', browserSync.reload);
}



/*
https://dashboard.ngrok.com/get-started
download zip and  sudo mv ngrok /usr/local/bin/
npm install ngrok -g
npm install ngrok
127.0.0.1:4040   переходим в админку и берем один из адресов
*/
function showServer() {
  browserSync.init({
    server: {
      baseDir: PROJECT_FOLDERS.PUBLIC
    },
    notify: false // Отключаем уведомления в браузере
  }, function (err, bs) {
    ngrok.connect({
      proto: 'http', // http|tcp|tls
      addr: bs.options.get('port') // port or network address
    }, function (err, url) {
      console.log(url, err); //ошибки в консоли
    });
  });
  
  console.log("----------- Admin panel ngrok ------------");
  console.log("Go to address: | http://127.0.0.1:4040 |");
  console.log("------------------------------------------");
}

/************************************ tasks **********************************/

gulp.task("style", style); //gulp style    скомпилирует только sass -> css
gulp.task("style-min", styleProd); //gulp production   спокмилирует, причешет, добавит префиксы

gulp.task("js-polyfill", polyfillJS); //библиотеки для старых браузеров
gulp.task("js", script); //склеивает все подключенные скрипты в один файл
gulp.task("js-lib", libsJS); //склеивает все подключенные библиотеки
gulp.task("js-min", minJs); //сжимает склеинные скрипты

gulp.task("fonts", fonts); //gulp fonts   переносит шрифты с папками в папку public
gulp.task("template", template); //gulp template   переносит html в папку public
gulp.task("del", clean); //gulp del   удалит папку public

gulp.task("favicon", favicon); //gulp favicon   переносит favicon с папками в папку public
gulp.task("image-min", imageMin); //gulp image-min   сжимаем все картинки и переносим в public/image
gulp.task("image-responsive", imageResponsive); //gulp image-min   сжимаем все картинки и переносим в public/image

gulp.task("dev", watch); //gulp dev    запустит сервер. Откроет все в браузере и будет обновлять страницу при любом измненении в файлах sass scss html
gulp.task("server", showServer); //gulp server реальный сервер

gulp.task("production", gulp.series(clean, favicon, imageMin, polyfillJS, script, libsJS, minJs, gulp.parallel(styleProd, fonts, template))); //gulp production   минимицированные и причессаные стили, перенос шрифтов и html, сжатие картинок

gulp.task("default", gulp.series("dev")); //gulp
