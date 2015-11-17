module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-connect');
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

      browserify: {
        options: {
          debug: true
        },
        unit: {
          files: {
            'tests/bundle.js': ['tests/*.js', '!tests/bundle.js']
          }
        }
      }

    });

    grunt.registerTask('unit', ['browserify:unit', 'connect:unit']);

};
