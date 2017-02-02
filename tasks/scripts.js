'use strict';

const gulp = require('gulp');

const $ = require('gulp-load-plugins')();
const combine = require('stream-combiner2').obj;

module.exports = function(options){

    return function(){
        return combine(

            gulp.src(options.src , {since : gulp.lastRun('js')}),

            $.jade({
                pretty: '\t',
                client: true
            }),
            gulp.dest('public/js')

        ).on('error' , $.notify.onError(function(err){
            return{
                title: 'Scripts',
                message: err.message
            }
        }))
    };
};