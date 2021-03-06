const {
    src,
    dest,
    parallel,
    series,
    watch
} = require('gulp');


const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const imagemin = require('gulp-imagemin');
const changed = require('gulp-changed');
const browsersync = require('browser-sync').create();


const clear = () => {
    return src('./public/*', {
            read: false
        })
        .pipe(clean());
}

const js = () => {
    const source = './src/assets/js/*.js';

    return src(source)
        .pipe(changed(source))
        .pipe(concat('bundle.js'))
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest('./public/js/'))
        .pipe(browsersync.stream());
}

const css = () => {
    const source = './src/assets/scss/**/*.scss';

    return src(source)
        .pipe(changed(source))
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(cssnano())
        .pipe(dest('./public/css/'))
        .pipe(browsersync.stream());
}

const img = () => {
    return src('./src/assets/img/*')
        .pipe(imagemin())
        .pipe(dest('./public/img'));
}

const html = () => {
    const source = './index.html';
    return src(source)
        .pipe(browsersync.stream());
}

const watchFiles = () => {
    watch('./src/assets/scss/**/*.scss', css);
    watch('./src/assets/js/*', js);
    watch('./src/assets/img/*', img);
    watch('./*.html', html);
}

const browserSync = () => {
    browsersync.init({
        server: {
            baseDir: './'
        },
        port: 3000
    });
}


exports.watch = parallel(watchFiles, browserSync);
exports.default = series(clear, parallel(js, css, img, html));