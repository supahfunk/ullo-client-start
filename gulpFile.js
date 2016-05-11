/// <binding ProjectOpened='start' />
'use strict';


/****************
 *** REQUIRES ***
 ****************/
var gulp = require('gulp'),
    fs = require('fs'),
    promise = require('es6-promise'),
    rewrite = require('connect-modrewrite'),
    webserver = require('gulp-webserver'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    sourcemaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
	jshint = require('gulp-jshint'),
	csslint = require('gulp-csslint');
    /*
    sass = require('gulp-sass'),
    scsslint = require('gulp-scss-lint');
    */


/****************
 *** DEFAULTS ***
 ****************/
var defaults = {
	lints: {
		js: false,
		css: false,
		scss: false,
	}
};


/*****************
 *** VARIABLES ***
 *****************/
var config, paths, folders, bundles, browserlist, lints, server;
function loadConfig() {
	config = JSON.parse(fs.readFileSync('./config.json'));
	for (var p in defaults) {
		config[p] = config[p] || defaults[p];
	}
	paths = config.paths;
	folders = config.folders;
	bundles = config.bundles;
	browserlist = config.browserlist;
	lints = config.lints;
	server = config.server;
}
loadConfig();

/****************
 *** PATTERNS ***
 ****************/
var matches = {
    everything: '/**/*.*',
    less: '/**/*.less',
    sass: '/**/*.scss',
    css: '/**/*.css',
    js: '/**/*.js',
    typescript: '/**/*.ts',
    jade: '/**/*.jade',
};
var excludes = {
    everything: '/**/*.*',
    less: "/**/_*.less",
    sass: "/**/_*.scss",
    css: "/**/*.min.css",
    js: "/**/*.min.js"
};


/************
 *** LESS ***
 ************/
gulp.task('less:compile', function() {
    console.log('less:compile COMPILING!');
    return gulp.src([
        paths.src + matches.less,
        '!' + paths.src + excludes.less,
        '!' + paths.node + excludes.everything,
        '!' + paths.bower + excludes.everything,
    ], { base: paths.src })
        .pipe(plumber(function (error) {
            console.log('less:compile.plumber', error);
        }))
        .pipe(sourcemaps.init())
        .pipe(less().on('less:compile.error', function (error) {
            console.log(error);
        }))
        // .pipe(sourcemaps.write()) // save .map
        .pipe(autoprefixer({ browsers: browserlist })) // autoprefixer
        .pipe(gulp.dest(paths.root)) // save .css
        .pipe(cssmin())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(paths.root)); // save .min.css
});
gulp.task('less:watch', function() {
    var watcher = gulp.watch(paths.src + matches.less, ['less:compile']);
    watcher.on('change', function(e) {
        console.log('watcher.on.change type: ' + e.type + ' path: ' + e.path);
    });
    return watcher;
});
gulp.task('less', ['less:compile', 'less:watch']);


/************
 *** SASS ***
 ************/
/*
gulp.task('sass:compile', function() {
    console.log('sass:compile COMPILING!');
    var pipes = gulp.src([
        paths.src + matches.sass,
        '!' + paths.src + excludes.sass,
        '!' + paths.node + excludes.everything,
        '!' + paths.bower + excludes.everything,
    ], { base: paths.src })
        .pipe(plumber(function (error) {
            console.log('sass:compile.plumber', error);
        }));
	if (lints.scss) {
		pipes = pipes.pipe(scsslint());
	}
	pipes = pipes.pipe(sourcemaps.init())
	.pipe(sass().on('sass:compile.error', function (error) {
		console.log(error);
	}))
	// .pipe(sourcemaps.write()) // save .map
	.pipe(autoprefixer({ browsers: browserlist })) // autoprefixer
	.pipe(gulp.dest(paths.root)) // save .css
	.pipe(cssmin())
	.pipe(rename({ extname: '.min.css' }))
	.pipe(gulp.dest(paths.root)); // save .min.css
	return pipes;
});
gulp.task('sass:watch', function() {
    var watcher = gulp.watch(paths.src + matches.sass, ['sass:compile']);
    watcher.on('change', function(e) {
        console.log('watcher.on.change type: ' + e.type + ' path: ' + e.path);
    });
    return watcher;
});
gulp.task('sass', ['sass:compile', 'sass:watch']);
*/

/******************
 *** JS BUNDLES ***
 ******************/
var jsbundles = [];
bundles.js.forEach(function(bundle, i) {
	loadConfig();
    var key = 'js:bundle:' + i;
    jsbundles.push(key);
    gulp.task(key, function() {
        var pipes = gulp.src(bundle.src, { base: '.' })
        .pipe(plumber(function(error) {
            console.log(key + '.plumber', error);
        }))
        if (lints.js || bundle.lints) {
			pipes = pipes.pipe(jshint());
		}
        if (bundle.folder) {
            console.log(key, 'do:folder', bundle.folder, bundle.src);
            pipes = pipes.pipe(rename({
                dirname: '', // flatten directory
            })).pipe(gulp.dest(bundle.folder)); // copy files
        }
		if (bundle.dist) { // concat bundle
            console.log(key, 'do:concat', bundle.dist, bundle.src);
            pipes = pipes.pipe(rename({
                dirname: '', // flatten directory
            }))
            .pipe(concat(bundle.dist)) // concat bundle
            .pipe(gulp.dest('.')) // save .js
            .pipe(sourcemaps.init())
            .pipe(uglify()) // { preserveComments: 'license' }
            .pipe(rename({ extname: '.min.js' }))
            .pipe(sourcemaps.write('.')) // save .map
            .pipe(gulp.dest('.')); // save .min.js
        }
        return pipes;
    });
});
gulp.task('js:bundles', jsbundles, function(done) { done(); });
gulp.task('js:watch', function () {
    var sources = ['./config.json'];
    bundles.js.forEach(function (bundle, i) {
        bundle.src.forEach(function (src, i) {
            sources.push(src);
        });
    });
    var watcher = gulp.watch(sources, ['js:bundles']);
    watcher.on('change', function(e) {
        console.log(e.type + ' watcher did change path ' + e.path);
    });
    return watcher;
});


/*******************
 *** CSS BUNDLES ***
 *******************/
var cssbundles = [];
bundles.css.forEach(function(bundle, i) {
	loadConfig();
    var key = 'css:bundle:' + i;
    jsbundles.push(key);
    gulp.task(key, function() {
        var pipes = gulp.src(bundle.src, { base: '.' })
        .pipe(plumber(function(error) {
            console.log(key + '.plumber', error);
        }))
        if (lints.css || bundle.lints) {
			pipes = pipes.pipe(csslint());
		}
        if (bundle.folder) {
            console.log(key, 'do:folder', bundle.folder, bundle.src);
            pipes = pipes.pipe(rename({
                dirname: '', // flatten directory
            })).pipe(gulp.dest(bundle.folder)); // copy files
        }
        if (bundle.dist) {
            console.log(key, 'do:concat', bundle.dist, bundle.src);
            pipes = pipes.pipe(rename({
                dirname: '', // flatten directory
            }))
            .pipe(concat(bundle.dist)) // concat bundle
            .pipe(gulp.dest('.')) // save .css
            .pipe(sourcemaps.init())
            .pipe(cssmin())
            .pipe(rename({ extname: '.min.css' }))
            .pipe(sourcemaps.write('.')) // save .map
            .pipe(gulp.dest('.')); // save .min.css
        }
        return pipes;
    });
});
gulp.task('css:bundles', cssbundles, function(done) { done(); });
gulp.task('css:watch', function() {
    var sources = ['./config.json'];
    bundles.css.forEach(function (bundle, i) {
        bundle.src.forEach(function (src, i) {
            sources.push(src);
        });
    });
    var watcher = gulp.watch(sources, ['css:bundles']);
    watcher.on('change', function(e) {
        console.log(e.type + ' watcher did change path ' + e.path);
    });
    return watcher;
});


/***************
 *** COMPILE ***
 ***************/
gulp.task('compile', ['less:compile', /*'sass:compile',*/ 'css:bundles', 'js:bundles'], function(done) { done(); });


/*************
 *** SERVE ***
 *************/
gulp.task('serve', ['compile'], function() {
    // more info on https://www.npmjs.com/package/gulp-webserver
    var options = {
        host: server.name,
        port: server.port,
        directoryListing: true,
        open: true,
        middleware: [
            rewrite([
                '!\\.html|\\.js|\\.css|\\.map|\\.svg|\\.jp(e?)g|\\.png|\\.gif$ /index.html'
            ])
        ],
        livereload: {
            enable: true, // need this set to true to enable livereload
            filter: function(filename) {
                return !filename.match(/.map$/); // exclude all source maps from livereload
            }
        },
    };
    return gulp.src(paths.root).pipe(webserver(options));
});


/*************
 *** WATCH ***
 *************/
gulp.task('watch', ['less:watch', /*'sass:watch',*/ 'css:watch', 'js:watch'], function(done) { done(); });


/*************
 *** START ***
 *************/
gulp.task('start', ['compile', 'serve', 'watch'], function (done) { done(); });


/*******************
 *** TRAVIS TEST ***
 *******************/
gulp.task('test', ['compile'], function (done) { done(); });
