'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();

function lazyRequireTask(taskName, path, options){
    options.taskName = taskName;
    gulp.task(taskName, function(callback){
        let task = require(path).call(this, options);

        return task(callback);
    });
}
lazyRequireTask('styles','./tasks/styles',{
    src: 'frontend/styles/main.styl'
});

lazyRequireTask('jade','./tasks/jade',{
    src : ['frontend/jade/**/*.jade', '!frontend/jade/**/_*.jade']
});

lazyRequireTask('js','./tasks/scripts',{
    src : 'frontend/js/**/*.js'
});

lazyRequireTask('images','./tasks/image',{
    src : 'frontend/img/**/*.+(png|jpg|jpeg|gif|svg)'
});

lazyRequireTask('fonts','./tasks/fonts',{
    src : 'frontend/fonts/**/*'
});

lazyRequireTask('clean','./tasks/clean',{
    dst: 'public'
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles','jade','js','images','fonts'))
);

gulp.task('watch', function(){
    gulp.watch('frontend/jade', gulp.series('jade')).on('unlink', function(filepath){
        remember.forget('jade', path.resolve(filepath))
    });
    gulp.watch('frontend/js', gulp.series('js')).on('unlink', function(filepath){
        remember.forget('js', path.resolve(filepath))
    });
    gulp.watch('frontend/styles', gulp.series('styles')).on('unlink', function(filepath){
        remember.forget('styles', path.resolve(filepath))
    });
    gulp.watch('frontend/img', gulp.series('images')).on('unlink', function(filepath){
        remember.forget('images', path.resolve(filepath))
    });
});

gulp.task('serve', function(){
    browserSync.init({
        server: {
            baseDir: "./public" // Change this to your web root dir
        }
        // server: true
    });
    browserSync.watch('public/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));

gulp.task('prod', gulp.series('build'));