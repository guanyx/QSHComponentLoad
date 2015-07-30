var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('compress', function() {
    return gulp.src('src/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('svn', function(){
    ['src', 'dist', 'test'].forEach(function(name){
        gulp.src(name+"/*")
            .pipe(gulp.dest('mLoad/'+name));
    });
    return gulp.src(['.gitignore', 'gulpfile.js', 'package.json', 'ReadMe.md'])
        .pipe(gulp.dest('mLoad'));
});

gulp.task('default', ['compress']);