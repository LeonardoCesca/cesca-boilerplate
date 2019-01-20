var resources = 'assets/';
var gulp = require('gulp');
var autoprefixer = require('autoprefixer');
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var buffer = require('vinyl-buffer');
var clone = require('gulp-clone');
var cssImport = require('postcss-import');
var imagemin = require('gulp-imagemin');
var path = require('path');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var sass = require('gulp-sass');
var webp = require('gulp-webp');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');

var cssPlugins = [
    autoprefixer({ remove: false, browsers: '> 1%, last 2 versions, ie 9' }),
    cssImport
];

var cloneSink = clone.sink();

var onError = function (err) {
    console.log(err);
    this.emit('end');
};

gulp.task('serve', ['build'], function () {

    browserSync.init({
        server: {
            baseDir: "./",
            index: "index.html",
            proxy: "http://localhost"
        },
    });

    gulp.watch(resources + 'scss/**/*.scss', ['css-minify']);
    gulp.watch(resources + 'js/main.js', ['js-minify']);
    gulp.watch(resources + 'img/**/*', ['images']);

    gulp.watch("*.html").on("change", browserSync.reload);
});

gulp.task('build', ['css-rev', 'js-rev', 'images']);

gulp.task('css-compile', function () {
    return gulp.src([resources + 'scss/**/*.scss', '!' + resources + 'scss/**/_*.scss'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss(cssPlugins))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(resources + 'css'));
});

gulp.task('css-minify', ['css-compile'], function () {
    return gulp.src([resources + 'css/*.css', '!' + resources + 'css/*.min.css'])
        .pipe(uglifycss())
        .pipe(rename(function (path) {
            path.extname = '.min.css';
        }))
        .pipe(gulp.dest(resources + 'css'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js-minify', function () {
    return browserify(resources + 'js/main.js')
        .transform(babelify)
        .bundle()
        .on('error', function (err) {
            console.log(err);
            this.emit("end");
        })
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(resources + 'js'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('js-rev', ['js-minify'], function () {
    return gulp.src([resources + 'js/*.min.js'])
        .pipe(rev())
        .pipe(rev.manifest(resources + 'rev-manifest.json', {
            base: resources,
            merge: true,
        }))
        .pipe(gulp.dest(resources));
});

gulp.task('css-rev', ['css-minify'], function () {
    return gulp.src([resources + 'css/*.min.css'])
        .pipe(rev())
        .pipe(rev.manifest(resources + 'rev-manifest.json', {
            base: resources,
            merge: true,
        }))
        .pipe(gulp.dest(resources));
});

gulp.task('images', function () {
    return gulp.src(resources + 'img/**/*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(cloneSink)
        .pipe(webp())
        .pipe(cloneSink.tap())
        .pipe(gulp.dest(resources + 'img'))
        .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
