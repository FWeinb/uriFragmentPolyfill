/* Default Grunt file*/
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
              ' *  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
              ' */'
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', 'uriFragment.jquery.js'],
        dest: 'uriFragment.jquery.min.js'
      }
    },
    lint: {
      files: ['uriFragment.jquery.js']
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint min');

};