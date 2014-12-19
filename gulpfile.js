var gulp = require('gulp');
var less = require('gulp-less');  
var path = require('path');

var paths = {
  indexStyleSheet: 'public/less/index.less',
  lobbyStyleSheet: 'public/less/lobby.less',
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

gulp.task('watch', function() {
  gulp.watch(paths.styles, ['lobbyCss','indexCss']);
});

gulp.task('default', ['watch'])