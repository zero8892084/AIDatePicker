module.exports = function(grunt) {
    // 构建任务配置
    grunt.initConfig({
        //读取package.json的内容，形成个json数据
        pkg: grunt.file.readJSON('package.json'),
        clean:{
            test:{
                src:''
            }
        },
        copy:{
            ai:{
                files: [
                    {
                      expand: true,
                      cwd: 'src/css',
                      src: ['*.css'],
                      dest: './'
                    },
                    {
                      expand: true,
                      cwd: 'src/js',
                      src: ['*.js'],
                      dest: './'
                    }
                ]
            }
        },
        cssmin:{
            ai:{
                files: [{
                  expand: true,
                  cwd: 'src/css',
                  src: ['*.css'],
                  dest: '.',
                  ext: '.min.css'
                }]
            }
        },
        uglify:{
            ai:{
                files: [{
                  expand: true,
                  cwd: 'src/js',
                  src: ['*.js'],
                  dest: '.',
                  ext: '.min.js'
                }]
            }
        }
    });

    // 加载指定插件任务
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // 默认执行的任务
    grunt.registerTask('ai', ['cssmin:ai','uglify:ai','copy:ai']);
};
