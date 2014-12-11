var gulp = require('gulp');
var less = require('gulp-less');  
var path = require('path');

var paths = {
  mainStyleSheet: 'public/less/lobby.less',
  styles: 'public/less/*.less'
};

gulp.task('css', function () {  
  return gulp.src(paths.mainStyleSheet)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('public/css'))
});

gulp.task('watch', function() {
  gulp.watch(paths.styles, ['css']);
});

gulp.task('default', ['watch'])