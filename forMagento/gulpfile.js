'use strict';

const gulp              = require('gulp');
const gulpLoadPlugins   = require('gulp-load-plugins');
const autoprefixer      = require('autoprefixer');
const assets            = require('postcss-assets');
const browserSync       = require('browser-sync');
const del               = require('del');
const sprites           = require('postcss-sprites').default;
const spritesUpdateRule = require('postcss-sprites').updateRule;
const postcss           = require('postcss');
const cssnano           = require('cssnano');
const pxtorem           = require('postcss-pxtorem');
const selectorMatches   = require('postcss-selector-matches');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

//=========================================================================

const jQueryInside = true;
const APP = {
    src:{
        path:      './src',
        fonts:     './src/fonts',
        img:       './src/img',
        wysiwyg:   './src/wysiwyg',
        styles:    './src/styles',
        components:'./src/components',
        templates :'./src/templates',
        js:        './src/js'
    },
    build:{
        path:      './build',
        pages:     './build/pages',
        fonts:     './build/fonts',
        img:       './build/img',
        wysiwyg:   './build/wysiwyg',
        styles:    './build/styles',
        js:        './build/js'
    }
};

//==========================================================================


//////////////////  HTML ===================================================

gulp.task('templates', () => {
    return gulp.src([APP.src.templates + '/**/[^_]*.html', APP.src.components + '/**/[^_]*.html'])
        .pipe($.nunjucksRender({path:[APP.src.templates, APP.src.components]}))
        .pipe(gulp.dest(APP.build.pages))
        .pipe(reload({
            stream: true
        }));
});



//////////////// STYLES ===================================================

gulp.task('less', () => {
    return gulp.src([APP.src.styles + '/**/styles.less'])
        .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.messages %>>')}))
        .pipe($.sourcemaps.init())
        .pipe($.less())
        // .pipe($.concat('styles'))
        .pipe($.postcss([
            assets({
                basePath: APP.src.path + '/',
                cachebuster: true,
                loadpath: [APP.src.img + '/']
            }),
            // sprites({
            //     stylesheetPath: './' + APP.tmp.styles,
            //     spritePath: + './' + APP.tmp.img,
            //     filterBy(image){
            //         //Allow only png files
            //         if(!/\/?sprites\/.*\.png$/.test(image.url)){
            //             return Promise.reject();
            //         }
            //
            //         return Promise.resolve();
            //     },
            //     hooks: {
            //         onUpdateRule(rule, token, image) {
            //             // Use built-in logic for background-image & background-position
            //             spritesUpdateRule(rule, token, image);
            //
            //             ['width', 'height'].forEach((prop) => {
            //                  rule.insertAfter(rule.last, postcss.decl({
            //                     prop,
            //                     value: image.coords[prop] + 'px',
            //                 }));
            //             });
            //         }
            //     }
            // }),
            selectorMatches(),
            pxtorem({
                propList: ['font', 'font-size', 'line-height', 'letter-spacing',
                    'margin',
                    'padding',
                    'left','top','right','bottom',
                    'width','height',
                    'border',
                    'border-radius']
            }),
            autoprefixer({browsers: ['> 1%', 'last 2 versions', 'ie 6-8', 'Firefox ESR', 'iOS 7']})
        ]))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(APP.build.styles))
        .pipe(reload({stream: true}));
});


///////////////////////// JS ===================================================

gulp.task('copy:jquery', () => {
   return gulp.src('node_modules/jquery/dist/jquery.min.js')
       .pipe($.if(!jQueryInside, gulp.dest(APP.build.js)))
       .pipe($.if(!jQueryInside, reload({stream: true})));
});


gulp.task('js', () => {
    return gulp.src([ APP.src.js + '/**/*.js', APP.src.components + '/**/*.js'])
        .pipe($.plumber({errorHandler: $.notify.onError('Error: <%= error.messages %>>')}))
        .pipe($.sourcemaps.init())
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(APP.build.js))
        .pipe(reload({stream: true}));
});

///////////////////////// IMAGES ===================================================

gulp.task('copy:sprites', () => {
    return gulp.src(APP.build.img + '/*.*')
        .pipe(gulp.dest(APP.build.img));
});

gulp.task('img', () => {
    return gulp.src(APP.src.img + '/*.*')
        .pipe($.cache($.imagemin()))
        .pipe(gulp.dest(APP.build.img));
});

gulp.task('wysiwyg', () => {
    return gulp.src(APP.src.wysiwyg + '/*.*')
        .pipe($.cache($.imagemin()))
        .pipe(gulp.dest(APP.build.wysiwyg));
});


///////////////////////// FONTS ===================================================

gulp.task('fonts', () => {
    return gulp.src(APP.src.fonts + '/*.*')
        .pipe(gulp.dest(APP.build.fonts));
});

////////////////////////  CLEAN ===================================================

gulp.task('clean', del.bind(null, [APP.build.path]));

//////////////////////// Default TASKS ============================================

gulp.task('default',['templates','less','copy:jquery','js'], () =>{

//////////////////////// Browser Sync =============================================

    browserSync.init({
        server: {
            baseDir: APP.build.pages
        }
    });

//////////////////////// WATCH ====================================================

    gulp.watch([APP.src.components + '/**/*.less', APP.src.styles + '/**/*.less'],['less']);
    gulp.watch([APP.src.components + '/**/*.js', APP.src.js + '/**/*.js'],['js']);
    gulp.watch(APP.src.fonts + '/*.*',['fonts']);
    gulp.watch([APP.src.templates + '/**/[^_]*.html', APP.src.components + '/**/[^_]*.html'],['templates']);

    gulp.watch([
        APP.src.js + '/*.js',
        APP.src.images + '/*.*',
        APP.src.wysiwyg + '/*.*',
        APP.src.fonts + '/*.*'
    ]).on('change', reload);

});

//////////////////////// MINIFY ===================================================

gulp.task('minify:css', () => {
    return gulp.src(APP.build.styles + '/*.css')
        .pipe($.cache($.postcss([cssnano({autoprefixer: false})])))
        .pipe(gulp.dest(APP.build.styles));
});

gulp.task('minify:js', () => {
    return gulp.src(APP.build.js + '/*.core.min.js')
        .pipe($.cache($.uglify()))
        .pipe(gulp.dest(APP.build.js));
});

//////////////////////// Bulding ==================================================

gulp.task('pretty', ['less', 'js'], () => {
    return gulp.src(APP.build.path + '/*.html')
        .pipe($.prettify({indent_size:2, eol: '/r/n'}))
        .pipe($.useref({
            searchPath: [APP.build.path, APP.src.path, '.'],
            noAssest: false
        }))
        .pipe(gulp.dest(APP.build.path));
});


gulp.task('build:process', ['pretty','wysiwyg', 'img', 'fonts', 'copy:jquery'], () => {
    gulp.start('minify:css', 'minify:js', 'copy:sprites');
});

gulp.task('build', ['clean'], () => {
    gulp.start('build:process');
});