module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');

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
          files: ['./*.js', '!./Gruntfile.js', './domain/*.js', './holdem/*.js', './lib/*.js', './tests/*.js', './tests/**/*.js', '!./tests/bundle.js'],
          tasks: ['eslint:js', 'browserify:unit']
        }
      },

      browserify: {
        options: {
          debug: true
        },
        unit: {
          files: {
            'tests/bundle.js': ['./tests/*.js', './tests/**/*.js', '!./tests/bundle.js']
          }
        }
      },

      eslint: {
        options: {
          configFile: 'eslint.json'
        },
        js: ['./*.js', '!./Gruntfile.js', './domain/*.js', './holdem/*.js', './lib/*.js']
      }

    });

    grunt.registerTask('unit', ['browserify:unit', 'connect:unit']);

};
