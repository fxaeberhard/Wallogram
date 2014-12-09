var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');

var paths = {
  styles: 'public/less/*.less'
};

gulp.task('less', function () {
  gulp.src(paths.styles)
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('public/css'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.styles, ['less']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch']);