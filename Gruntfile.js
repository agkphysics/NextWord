module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    copy: {
      jquery: {
        expand: true,
        src: "bower_components/jquery/dist/*.min.js",
        dest: "public/js/",
        flatten: true,
        filter: "isFile"
      },
      bootstrap: {
        files: [
          { expand: true, src: "bower_components/bootstrap/dist/js/*.min.js", dest: "public/js/", flatten: true, filter: "isFile" },
          { expand: true, src: "bower_components/bootstrap/dist/css/*.min.css", dest: "public/css/", flatten: true, filter: "isFile" },
          { expand: true, src: "bower_components/bootstrap/dist/fonts/*.*", dest: "public/fonts/", flatten: true, filter: "isFile" }
        ]
      },
      css: {
        expand: true,
        src: "src/*.css",
        dest: "public/css/",
        flatten: true,
        filter: "isFile"
      }
    },

    ts: {
      options: {
        module: "system",
        sourceMap: false,
        target: "es5"

      },
      default: {
        src: ["src/*.ts", "!node_modules/**"],
        dest: "public/js/main.js"
      }
    },

    uglify: {
      options: {
        banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"dd-mm-yyyy\") %> */\n"
      },
      dist: {
        files: {
          "public/js/main.min.js": ["<%= ts.default.dest %>"]
        }
      }
    },

    browserSync: {
      bsFiles: {
        src: [
          'public/*/*.*',
          "index.html"
        ]
      },
      options: {
        server: {
          baseDir: "./"
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.loadNpmTasks("grunt-browser-sync");

  grunt.registerTask("default", ["copy", "ts", "uglify"]);
  grunt.registerTask("build", ["copy:css", "ts", "uglify"]);
  grunt.registerTask("bsync", ["browserSync"]);
};
