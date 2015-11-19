module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.initConfig({

      connect: {
        options: {
          hostname: '127.0.0.1',
          keepalive: true,
          open: true,
          port: 8081,
          protocol: 'http'
        },
        unit: {
          options: {
            base: './'
          }
        }
      },

      watch: {
        options: {
          livereload: 35740
        },
        unit: {
          files: ['./lib/index.js', './lib/holdem-sequence.js', './lib/*.js', './tests/*.js', './tests/**/*.js', '!./tests/bundle.js'],
          tasks: ['browserify:unit']
        }
      },

      browserify: {
        options: {
          debug: true
        },
        unit: {
          files: {
            'tests/bundle.js': ['tests/*.js', 'tests/**/*.js', '!tests/bundle.js']
          }
        }
      }

    });

    grunt.registerTask('unit', ['browserify:unit', 'connect:unit']);

};
