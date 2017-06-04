var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
 
gulp.task('default', function () {
  return gulp.src('src/templates/**/*.html')
    .pipe(templateCache({module:'irontec.simpleChat'}))
    .pipe(gulp.dest('src/scripts'));
});
