'use strict';

const gulp = require('gulp');

const $ = require('gulp-load-plugins')();
const combine = require('stream-combiner2').obj;

module.exports = function(options){

    return function(){
        return combine(

            gulp.src(options.src , {since : gulp.lastRun('styles')}),
            $.sourcemaps.init(),
            $.stylus(),
            $.autoprefixer(),
            $.sourcemaps.write('.'),
            gulp.dest('public/style')

        ).on('error' , $.notify.onError(function(err){
            return{
                title: 'Styles',
                message: err.message
            }
        }))
    };
};
