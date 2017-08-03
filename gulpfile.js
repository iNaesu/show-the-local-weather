var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp.watch("./scss/style.scss", ['sass','sass-watch']);
  gulp.watch("./index.html").on('change', browserSync.reload);
  gulp.watch("./js/index.js").on('change', browserSync.reload);
  gulp.watch("./scss/style.css").on('change', browserSync.reload);

});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
  return gulp.src("scss/style.scss")
    .pipe(sass())
    .pipe(gulp.dest("./scss"))
    .pipe(browserSync.stream());
});

gulp.task('sass-watch', ['sass'], browserSync.reload);
gulp.task('default', ['serve']);
