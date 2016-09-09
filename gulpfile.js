'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const babel = require('gulp-babel');
const minifyCSS = require('gulp-minify-css');
const concatCSS = require('gulp-concat-css');
const minifyJS = require('gulp-minify');

gulp.task('sass', () => {
  gulp.src('./src/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(concatCSS('./styles/styles.css'))
    .pipe(minifyCSS())
    .pipe(notify('css built'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('sass:watch', () => {
  gulp.watch('./src/scss/*.scss', ['sass']);
});

gulp.task('html', () => {
  gulp.src('./src/index.html')
    .pipe(notify('html built'))
    .pipe(gulp.dest('./'));
});

gulp.task('html:watch', () => {
  gulp.watch('./src/index.html', ['html']);
});

gulp.task('js', () => {
  gulp.src('./src/js/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(minifyJS({
      min: '.js'
    }))
    .pipe(notify('js built'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('js:watch', () => {
  gulp.watch('./src/js/*.js', ['js']);
});

gulp.task('img', () => {
  gulp.src('./src/img/*')
    .pipe(notify('images copied over'))
    .pipe(gulp.dest('./dist/img'));
});

gulp.task('build', ['html', 'sass', 'js', 'img']);
gulp.task('default', ['html', 'html:watch', 'sass', 'sass:watch', 'js', 'js:watch', 'img']);
