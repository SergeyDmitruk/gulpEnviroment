'use strict';

const gulp = require('gulp');

const $ = require('gulp-load-plugins')();
const combine = require('stream-combiner2').obj;

module.exports = function(options){

    return function(){
        return combine(

            gulp.src(options.src),
            $.imagemin({
                progressive: true,
                optimizationLevel: 1,
                svgoPlugins: [{removeViewBox: false}]
            }),
            gulp.dest('public/img')

        ).on('error' , $.notify.onError(function(err){
            return{
                title: 'Jade',
                message: err.message
            }
        }))
    };
};

