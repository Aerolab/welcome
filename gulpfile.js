'use strict';

var gulp = require('gulp');
var livereload = require('gulp-livereload');
var path = require('path');
var semverRegex = require('semver-regex');
var resolve = path.resolve;

gulp.task('clean-build', function() {
    return require('rimraf').sync(resolve(__dirname, 'build'));
});

gulp.task('build', ['clean-build'], function() {

    var electron = require('gulp-electron');
    var packageJson = require('./package.json');
    var matches = packageJson.devDependencies['electron'].match(semverRegex());

    return gulp.src('')
        .pipe(electron({
            src: './src',
            packageJson: packageJson,
            release: './build',
            cache: './cache',
            version: 'v' + matches[0],
            packaging: true,
            asar: true,
            platforms: [
                'darwin-x64'
            ],
            platformResources: {
                darwin: {
                    CFBundleDisplayName: packageJson.name,
                    CFBundleIdentifier: packageJson.name,
                    CFBundleName: packageJson.name,
                    CFBundleVersion: packageJson.version,
                    icon: './src/images/aerolab.icns'
                }
            }
        }))
        .pipe(gulp.dest(''));
});

gulp.task('dev', function(cb) {

    livereload.listen({port: 35729});

    gulp.watch('src/*', function(event) {
        gulp.src('src/*').pipe(livereload());
    });
    
    var isWin = /^win/.test(process.platform);
    const electronProcess = require('child_process')
    .exec((isWin ? 'sh' : 'node') + ' ./node_modules/.bin/electron ./src/', {
        cwd: __dirname,
        env: Object.assign( {}, process.env, {
            NODE_ENV: 'dev'
        })
    }, cb);

    electronProcess.stdout.on('data', function(data) {
        console.log(data);
    });

    electronProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data.toString());
    });
});
