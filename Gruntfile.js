'use strict';
//var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to match all subfolders:
// 'test/spec/**/*.js'

/*
 *  Tasks:
 *  - test: run tests
 *  - server: start a server on /app and watch for changes (With livereload)
 *  - build: build to www
 *  - build-app: build to www and build the mobile apps
 *  - (default): test and build-app
*/

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'www',
        livereloadPort: 35728 // @TODO: Not wired up to connect task
    };

    grunt.initConfig({

        yeoman: yeomanConfig,
        watch: {
            sass: {
                files: 'app/**/*.scss',
                tasks: 'sass:dev'
            },
            livereload: {
                files: [
                    '<%= yeoman.app %>/**/*.html',
                    '<%= yeoman.app %>/css/**.css',
                    '<%= yeoman.app %>/**/*.js',
                    '<%= yeoman.app %>/resources/**/*.{png,jpg,jpeg,webp}'
                ],
                options: {
                    livereload:'<%= yeoman.livereloadPort %>'
                }
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            dev: {
                options: {
                    middleware: function (connect) {
                        return [
                            //require('connect-livereload')(),
                            require('connect-livereload')({port:35728}), 
                            mountFolder(connect, 'app')
                        ];
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, 'www')
                        ];
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: ['<%= yeoman.dist %>/*']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/lib/*',
                'test/spec/{,*/}*.js'
            ]
        },
        sass: {
          dist: {
            options: {
              trace: true,
              style: 'compressed',
              lineNumbers: false,
              loadPath: ['app/bower_components/sass-bootstrap/lib','sass'],
              require: 'sass-globbing'  // required ruby library - `sudo gem install sass-globbing`
            },
            files: {
                'app/css/app.css':'app/sass/app.scss'
            }
          },
          dev: {
            options: {
              debugInfo: true,
              trace: true,
              style: 'nested',
              lineNumbers: true,
              loadPath: ['app/bower_components/sass-bootstrap/lib','sass'],
              require: 'sass-globbing'  // required ruby library - `sudo gem install sass-globbing`
            },
            files: {
                'app/css/app.css':'app/sass/app.scss'
            }
          }
        },
        // not used since Uglify task does concat,
        // but still available if needed
        /*concat: {
            dist: {}
        },*/
        uglify: {
            options: {
                mangle:false,
                beautify:true
            }
        },
        // requirejs: {
        //     dist: {
        //         options: {
        //             baseUrl: 'app/scripts',
        //             optimize: 'none',
        //             //modules: [
        //             //    {
        //             //        name:'main',
        //             //        exclude:['components/pointerevents/pointerevents.js']
        //             //    }
        //             //],
        //             preserveLicenseComments: false,
        //             useStrict: true,
        //             wrap: true,
        //             findNestedDependencies: true
        //         }
        //     }
        // },
        useminPrepare: {
            html: '<%= yeoman.app %>/index.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/css/{,*/}*.css'],
            options: {
                dirs: ['<%= yeoman.dist %>']
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/css/app.css': [
                        '.tmp/css/{,*/}*.css',
                        '<%= yeoman.app %>/css/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeCommentsFromCDATA: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: false,
                    removeOptionalTags: false
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: ['*.html','components/angular-components/{,*/}*.html','pages/{,*/}*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },        
        ngtemplates: {
            dist: {
                options: {
                    base:       '<%= yeoman.app %>',        // $templateCache ID will be relative to this folder
                    module:     'doctestApp',               // (Optional) The module the templates will be added to
                    concat:     'www/scripts/modules.js'    // (Optional) Append to existing `concat` target
                },
                src:          '<%= yeoman.app %>/bower_components/ace-*/*.html',
                dest:         '<%= yeoman.dist %>/scripts/templates.js'
            }
        },

        copy: {
             fontAwesome: {
                files : [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>/bower_components/font-awesome/font',
                    dest: '<%= yeoman.app %>/resources/fonts',
                    src: [
                        '**'
                    ]
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,txt}',
                        '.htaccess',
                        'config.xml',
                        'resources/**'
                    ]
                }]
            },
            dev: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '**'
                    ]
                }]
            }
        },
        bower: {
            all: {
                rjsConfig: '<%= yeoman.app %>/scripts/main.js'
            }
        },
        shell: {
          _options: {
            failOnError: true,
            stdout: true
          },
          build_ios: {
            command: 'cordova build ios'
          },
          build_android: {
            command: 'cordova build android'
          },
          emulate_ios: {
            command: 'cordova emulate ios'
          },
          emulate_android: {
            command: 'cordova emulate android'
          }
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run([
                'build', 
                'open', 
                'connect:dist:keepalive'
            ]);
        }

        grunt.task.run([
            'sass:dev',
            'copy:fontAwesome',
            //'livereload-start',
            'connect:dev',
            'open',
            'watch'
        ]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'sass:dev',
        'connect:test',
    ]);

    grunt.registerTask('build', function (target) {
        if (target == 'dev') {
            return grunt.task.run([
                'clean:dist',
                'sass:dev',
                'copy:fontAwesome',
                'copy:dev',
                'shell:build_android',
                'shell:build_ios'
            ]);
        } else {
            return grunt.task.run([
                'clean:dist',
                'sass:dist',
                //'bower',
                'useminPrepare',
                'ngtemplates',
                //'requirejs',
                'imagemin',
                'htmlmin',
                'concat',
                'cssmin',
                'uglify',
                'copy:fontAwesome',
                'copy:dist',
                'usemin',
                'shell:build_android',
                'shell:build_ios'
            ]);
        }
    });

    grunt.registerTask('emulate', function(target) {
        if (target === 'android') {
            return grunt.task.run([
                'build',
                'shell:emulate_android'
            ]);
        }
        return grunt.task.run([
            'build',
            'shell:emulate_ios'
        ]);

    });

    grunt.registerTask('default', [
        //'jshint',
        //'test',
        'build'
    ]);
};