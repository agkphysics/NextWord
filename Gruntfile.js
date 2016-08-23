module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      jquery: {
        expand: true,
        src: 'bower_components/jquery/dist/*.min.js',
        dest: 'public/js/',
        flatten: true,
        filter: 'isFile'
      },
      bootstrap: {
        files: [
          { expand: true, src: 'bower_components/bootstrap/dist/js/*.min.js', dest: 'public/js/', flatten: true, filter: 'isFile' },
          { expand: true, src: 'bower_components/bootstrap/dist/css/*.min.css', dest: 'public/css/', flatten: true, filter: 'isFile' }
        ]
      },
      angular: {
        expand: true,
        src: "bower_components/angular/*.min.js",
        dest: "public/js/",
        flatten: true,
        filter: 'isFile'
      }
    },

    ts: {
      options: {
        module: "commonjs"
      },
      default : {
        src: ["src/*.ts", "!node_modules/**"],
        dest: "public/js/main.js",
        watch: "src"
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          "public/js/main.js.min": ["<%= ts.default.dest %>"]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['copy', 'ts', 'uglify']);
};
