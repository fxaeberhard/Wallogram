var gulp = require('gulp');
var less = require('gulp-less');  
var path = require('path');

var paths = {
  indexStyleSheet: 'public/less/index.less',
  lobbyStyleSheet: 'public/less/lobby.less',
  screenStyleSheet: 'public/less/screen.less',
  baseStyleSheet: 'public/less/base.less',
  navStyleSheet: 'public/less/nav.less',
  styles: 'public/less/*.less'
};

gulp.task('lobbyCss', function () {  
  return gulp.src(paths.lobbyStyleSheet)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('public/css'))
});

gulp.task('indexCss', function () {  
  return gulp.src(paths.indexStyleSheet)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('public/css'))
});

gulp.task('screenCss', function () {  
  return gulp.src(paths.screenStyleSheet)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('public/css'))
});

gulp.task('baseCss', function () {  
  return gulp.src(paths.baseStyleSheet)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('public/css'))
});

gulp.task('navCss', function () {  
  return gulp.src(paths.navStyleSheet)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', function(err){ console.log(err.message); })
    .pipe(gulp.dest('public/css'))
});

gulp.task('watch', function() {
  gulp.watch(paths.styles, ['lobbyCss','indexCss','screenCss', 'baseCss', 'navCss']);
});

gulp.task('default', ['watch'])