#chrome插件几种使用CSS的方式#
针对全局用的css文件，在manifest.json中注册，
局部用的，比如插件界面，采用iframe的形式去注入比较合适

#`"run_at": "document_start" 导致document.body为null#
在manifest.json的`content_script中写入上述属性导致document.body引用null

#本地的脚本尤其要注意onload事件的使用#
不然会造成document.body引用为null


