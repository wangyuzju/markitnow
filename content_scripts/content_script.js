var PAGEURL = location.href ;

var p = {} ;

/****
 *p.util
 *共用程序
 */
(function(plugin){
  var pub = {};
  /*下拉菜单*/
  pub.downselect = function(obj, choices){
    var id = obj.id;

    var objbt = document.createElement('div');
    objbt.id = id+'bt' ;
    objbt.className = 'showAll';
    obj.parentNode.appendChild(objbt);

    var objchoices = document.createElement('ul');
    objchoices.id = id+'choices';
    var str = '';
    for(var i = 0 , l = choices.length ; i < l ; i++ ){
      str+= '<li style="box-shadow: 0 0 10px '+choices[i]+';border-color:'+choices[i]+'"></li>'
    }
    objchoices.innerHTML = str ;
    obj.parentNode.appendChild(objchoices);

    objchoices.style.position = 'absolute';
    objchoices.style.display = 'none';
    objchoices.style.width = obj.clientWidth + 'px' ;
    objchoices.style.left = obj.offsetLeft + 'px' ;

    //TODO
    var displayChange = plugin.util.toggle( objchoices.style , 'display' , 'none' , 'block' );
    objbt.onclick = function(){
      displayChange();
    }
    return displayChange;
  }
  /*变换状态*/
  pub.toggle = function(obj, property, state1, state2){
    var state = 1 ;
    return function(){
      if(state){
        obj[property] = state2;
        state = 0;
        return 1;
      }else{
        obj[property] = state1;
        state = 1;
        return 0;
      }
    };
  }
  /*可拖拽*/
  /**
   *drag
   *@param {Element} dragObj 点击的对象
   *@param {Element} moveObj 需要移动的对象
   */
  pub.drag = function(dragObj, moveObj){
    if ( moveObj == 'noChildren' ){//noChildren 忽略子元素冒泡上来的拖拽事件
      moveObj = undefined ;
      var noChildren = true ;
    }
    moveObj = moveObj || dragObj ;
    var startX
      ,startY
      ,stop ;
    //注意此方法是以当前窗口为0px，也就是说如果页面有滚动的话，要加上scrollY值
    moveObj.style.left = moveObj.style.left || moveObj.getBoundingClientRect().left + 'px' ;
    moveObj.style.top =  moveObj.style.top || moveObj.getBoundingClientRect().top +'px' ;

    dragObj.onmousedown = function(e){
      //有的时候，dragObj是外层容器，点击其内部会冒泡到它,因此要验证点击的是否是dragObj
      if( noChildren && e.target != dragObj ) { return ; }
      startX = e.clientX - moveObj.style.left.split('px')[0] ;
      startY = e.clientY - moveObj.style.top.split('px')[0] ;
      var that = moveObj ;//that为要移动的对象；
      /*注册拖拽事件*/
      document.onselectstart = function(){ return false };
      document.onmousemove = function(e){
        that.style.left = e.clientX - startX + 'px' ;
        that.style.top = e.clientY - startY + 'px' ;
      } ;
      /*注册清楚拖拽事件*/
      var cbBackUp = document.onmouseup ;
      document.onmouseup = function(e){
        document.onselectstart = null;
        document.onmousemove = null;
        p.data.localSave();
        /*self clean, avoid unnessary after Drag cleanup*/
        document.onmouseup = cbBackUp ;
      }
    }
  }
  /*dragResize*/
  /**
   *@param {Element} adjustObj - 在左侧改变大小时需要修正左侧位置
   */
  pub.dragResize = function( dragObj, resizeObj ,resizeDirect, adjustObj){
    var startX,
      startY,
      minWidth = 160,
      minHeight = 50 ;

    /*初次调用会写死其宽度和高度*/
    resizeObj.style.width = resizeObj.style.width || resizeObj.getBoundingClientRect().width + 'px';
    resizeObj.style.height = resizeObj.style.height || resizeObj.getBoundingClientRect().height + 'px';
    if( adjustObj ){
      adjustObj.style.left = adjustObj.style.left || adjustObj.getBoundingClientRect().left + 'px';
    }

    dragObj.onmousedown = function(e){
      startX = e.clientX - resizeObj.style.width.split('px')[0];
      startY = e.clientY - resizeObj.style.height.split('px')[0];
      if( adjustObj ){
        startLeft = e.clientX;
        //startLeft = e.clientX - resizeObj.style.left.split('px')[0];
      }

      document.onselectstart = function(){ return false };
      /*注册拖拽事件*/
      document.onmousemove = function(e){
        switch( resizeDirect ){
          case 'height':
            resizeObj.style.height =  e.clientY - startY  + 'px';
            break;
          case 'width':
            resizeObj.style.width =  e.clientX - startX  + 'px';
            break;
          case 'leftWidth':
          case 'leftWidthHeight':
            var moveSpace = e.clientX - startLeft ;
            /*宽度缩小移动的距离*/
            resizeObj.style.width =  resizeObj.style.width.split('px')[0] - 0 - moveSpace  + 'px';
            /*add! adjust left value for resizing by left side*/
            adjustObj.style.left = adjustObj.style.left.split('px')[0] - 0 + moveSpace + 'px';
            /*因为每次拖拽事件都要在现在的基础上加上移动距离，所以要更新原始点击的位置
             *而其余的都是在原始的基础上加上最终移动的距离，所以不必更新原始点击的位置
             */
            startLeft = e.clientX ;

            if( resizeDirect == 'leftWidthHeight' ){
              resizeObj.style.height =  e.clientY - startY  + 'px';
            }
            break;
          default:
            resizeObj.style.width =  e.clientX - startX  + 'px';
            resizeObj.style.height =  e.clientY - startY  + 'px';
            break;
        }
      //startX = e.clientX - resizeObj.style.width.split('px')[0];
      //startY = e.clientY - resizeObj.style.height.split('px')[0];
      }
      /*清除拖拽事件*/
      var cbBackUp = document.onmouseup ;
      document.onmouseup = function(e){
        document.onselectstart = null;
        document.onmousemove = null;
        p.data.localSave();
        /*self clean, avoid unnessary after Drag cleanup*/
        document.onmouseup = cbBackUp ;
      }
    }
  }

  /***
   *getTime()
   *@return {String} 返回如下格式的字符串 '2013/2/22 16:14:55'
   */
  pub.getTime = function(){
    var time = new Date();
    return ( time.getYear()+ 1900 ) + '/' + (time.getMonth() + 1) + '/' + time.getDate()
          + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
  }

  plugin.util = pub ;
})(p);

/****
 *init build the plugin
 */
(function(plugin){
  function init(){
    var pContainer = document.createElement('div');
    pContainer.id = '__plugin__';
    pContainer.onselectstart = function(){ return false; }

    pContainer.innerHTML =
      '<div id="__body__" style="display:none">'+
      '<div class="__bt__ __green__" id="highlight">高亮</div>'+
      '<br><br><div class="__bt__ __green__" id="recover">恢复</div>' +
      '<br><br><div class="__bt__ __green__" id="showMessage">清除</div>'+
      '</div>'+
      '<div id="__head__">'+
      '<div id="__head-left__">'+
      '<span class="actionbt" id="newNote">新建</span>'+
      '<span class="actionbt" id="sendMessage">备份</span>'+
      '<span class="actionbt" id="loadMessage">恢复</span>'+
      '</div>'+
      '<div id="__head-right__"></div>'+
      '</div>';

    document.body.appendChild( pContainer );

    /**
     *shadow
     */
    this.shadow = document.createElement('div');
    this.shadow.id = '__shadow__';
    document.body.appendChild( this.shadow );
    /*点击时退出*/
    plugin.shadow.onclick = plugin.note.exitEditMode ;

    /**
     *Toggle Max/Min Size
     */
    var pContainerId = '#' + pContainer.id;
    $('#__head-right__').click(function(){
      if( $(pContainerId).css('height') == '25px' ){
        $( pContainerId ).css('height','400px')
      $( pContainerId ).css('top', $(pContainerId).css('top').slice(0,-2) - 375 + 'px')
      $('#__body__').show();
      }else{
        $(pContainerId).css('height','25px')
      $( pContainerId ).css('top', $(pContainerId).css('top').slice(0,-2) - 0  + 375 + 'px')
      $('#__body__').hide();
      }
    })

    /**
     *插入控制面板
     */
    //var f = document.createElement("iframe");
    //f.id = "__plugin__"
    //f.src = chrome.extension.getURL("interface.html");
    //$('html').append(f);

    p.util.drag( $('#__head-left__')[0] , pContainer );

    p.attachEvents();
  }

  plugin.init = init ;
})(p);



var marked = {};

//prepareRange [因为要点击再高亮，而selecttion对象又无法保存，所以只好保存range对象]
function prepareRange(){
  var selected = window.getSelection();
  if(selected.toString() == ''){
    return ;
  }
  var extentNode = selected.extentNode;//结束位置所在的Node，注意和选择的方向有关,正序和反序
  var baseNode = selected.baseNode ;//开始位置所在的Node
  var range = selected.getRangeAt(0);
  if( extentNode == baseNode ){
    range.hlMethod = 1;
  }else{//将这些参数都封装在range对象里面，简化参数传递
    range.hlMethod = 0;
    range.hlObject = baseNode.parentNode;
  }
  return range ;
}
//highlight
function highlight(range){
  //var range = selected.getRangeAt(0);
  //如果extentNode == baseNode说明没有跨标签，可以直接使用surroundContents()方法
  //创建包围的span
  /**
   *添加外层span高亮
   */
  var span = document.createElement('span');
  span.style.backgroundColor = 'yellow';
  if(range.hlMethod){
    range.surroundContents(span); 
  }else{
    var flag = document.createElement('span');
    flag.id = 'hl1';
    range.insertNode(flag);
    range.setStart(flag.nextSibling,0);
    var fragment = range.extractContents();
    span.appendChild(fragment);
    document.getElementById('hl1').appendChild(span);
    //range.hlObject.insertAdjacentElement('afterEnd',span);
  }
}

/**
 *存储range，以便于恢复
 */
function addToMarked(range){
  var rangeid = range.toString();
  marked[rangeid] = {
    'start': {
      'tagName': range.startContainer.parentNode.nodeName,
      'index': locate( range.startContainer.parentNode ),
      'offset': range.startOffset},
    'end': {
      'tagName': range.endContainer.parentNode.nodeName,
      'index': locate(range.endContainer.parentNode),
      'offset': range.endOffset},
    'hlMethod': range.hlMethod,
    'hlObject': range.hlObject
  };
}
/**编码位置
 *@param {Element} obj 需要定位的元素 
 *@return {Number} 位置信息
 */
function locate(obj){
  var tagName = obj.nodeName ;
  var items = document.getElementsByTagName(tagName);
  for(var i = 0 ,l = items.length; i < l ; i++){
    if(obj === items[i] ){
      return i ;
    }
  }
}
/**解码位置
 *@param {object} 包含range信息的对象
 *@return {Range}
 **/
function decodeLocation(rangeInfo){
  var range = document.createRange();
  var startItem = document.getElementsByTagName(rangeInfo.start.tagName).item(rangeInfo.start.index).childNodes[0];
  var startOffset = rangeInfo.start.offset ;
  var stopItem = document.getElementsByTagName(rangeInfo.end.tagName).item(rangeInfo.end.index).childNodes[0];
  var stopOffset = rangeInfo.end.offset ;
  range.setStart(startItem,startOffset);
  range.setEnd(stopItem,stopOffset);
  range.hlMethod = rangeInfo.hlMethod;
  range.hlObject = rangeInfo.hlObject;
  return range ;
}
/**
 *解析range并高亮
 *@param {Object} marked 包含了各个range的对象集合
 **/
function handleMarked(items) {
  for(var mem in items){
    var range = decodeLocation(items[mem]);
    highlight(range);
  }
}

/****
 *Data Save/Recover
 */
(function(plugin){
  var pub = {} ;
  /***
   *localSave
   */
  pub.localSave = function(){
    plugin.note.localSave();
  }

  pub.remoteSave = function(){
    plugin.note.localSave();
    //send data to extension
    chrome.extension.sendMessage( localStorage[PAGEURL] || 'delete', function(response){
      console.log(response);
    });
  }

  pub.remoteLoad = function(){
    var message = 'load';
    chrome.extension.sendMessage( message, function(response){//该函数里面不用用alert阻塞语句
      //setTimeout(function(){alert(response)},10);//通过设置一个延迟来解决该Error,在NOTE.localLoad()语句里面
      if(response == 'clear'){
        delete localStorage[PAGEURL];
      }else{
        localStorage[PAGEURL] = response;
      }
      plugin.note.reset();
      plugin.note.localLoad();
    });
  }

  plugin.data = pub ;
})( p );

/**
 *注册各种按钮的事件
 */
(function(plugin){
  var pub = {};
  pub.init = function(){
    pub.menuRegist();
    pub.eventRegist();
    pub.highlightRegist();
  }

  pub.menuRegist = function(){
    /*新建Note*/
    $('#newNote').click(function(){
      console.log('create!');
      p.note.newItem();
      p.note.dumpItem();
    });
    //点击恢复
    $('#recover').click(recover);
    function recover(){
      if( localStorage.marked != null){
        marked = JSON.parse(localStorage.marked);
        handleMarked(marked);
      }else{
        alert('没有可以恢复的标记');
      }
    }
    //注册发送事件
    $('#sendMessage').click(function(){
      p.data.remoteSave();
    })
    //注册接收事件
    $('#loadMessage').click(function(){
      p.data.remoteLoad();
    });
  }
  /*注册一些全局事件*/
  pub.eventRegist = function(){
    //注册自动保存事件
    window.onunload = function(){
      p.data.localSave();
    }
    /*redraw NOTES location when window resized */
    window.onresize = function(){
      clearTimeout ( arguments.callee.tid );
      arguments.callee.tid = setTimeout(function(){
        p.note.init();
      },20)
    }
  }
  /*高亮功能相关事件注册*/
  pub.highlightRegist = function(){
    /***
     *highlight related!
     */
    var hl = document.getElementById('highlight');
    var range;
    hl.onmouseover = function(){
      range = prepareRange();
    };
    hl.onclick = function(){
      addToMarked(range);
      highlight(range);
    };
  }

  plugin.attachEvents = pub.init ;
})(p);

/****
 *Note Module
 */
(function(plugin){
  /* Notes Control 所有标注的控制部分 */
  var note = {
    init: function(){
      this.reset(); //clear the DOM Elements of notes

      //原型 '<div id="__select__"><input id="ds" class="__input__" type=text ></div>';
      this.toolbarInit();

      if( localStorage[PAGEURL] ){
        p.note.localLoad();
      }
    },
    toolbarInit:function(){
      if( !document.getElementById('__select__') ){
        this.toolbar = document.createElement('div');
        this.toolbar.id = '__select__';
        var s = document.createElement('div');
        s.id = 'ds';
        s.className = '__input__';
        s.type = 'text';
        this.toolbar.appendChild(s);
        this.toolbarChange = p.util.downselect( s,['#08c','#BD362F','#F89406','#1000CC','#000']);
      }
    },
    saveToolbar: function(){
      if( this.toolbar.parentElement ){
        this.toolbar.parentElement.removeChild(this.toolbar);
      }
    },
    getToolbar: function(){
      return this.toolbar ;
    },
    enterEditMode: function(){
      $(p.shadow).show().animate({opacity: .8});
    },
    exitEditMode: function(){
      $(p.shadow).animate({opacity: 0},function(){ $(this).hide() });
    },
    newItem: function(){
      this.notes[this.i] = new EditInPlaceField(this.i,
          document.body, {position:{top:window.scrollY+'px',left:'0px'}});
      this.i ++ ;
    },
    removeItem: function(obj){
      var j = obj.id;
      var i = --this.i ;//最后一个元素的id
      if( j != i ){//不相等，需要交换最后一个元素
        this.notes[j] = this.notes[i];
        this.notes[j].id = j ;
      }
      delete this.notes[i];
      document.body.removeChild(obj.containerElement);
    },
    reset: function(){
      for(var i = 0 , l = this.i ; i < l ; i++ ){
        this.notes[i].removeSelf();
        console.log('removed');
      }
      this.notes = {};
      this.i = 0 ;
    },
    echoItem:function(){
      console.log(this.notes);
    },
    dumpItem:function(){
      //初始化 从localStorage载入的notesSerial 好惨的bug。。。
      var notesSerial = {};
      for(var i = 0,l = this.i; i < l ; i++){
        notesSerial[i] = this.notes[i].fetchConfig();
      }
      notesSerial.total = l;//没有块级作用域，可以引用
      return notesSerial;
    },
    recoverItem: function(obj){
      for(var i = 0,l = obj.total; i < l ; i++ ){
        this.notes[i] = new EditInPlaceField( i,
            document.body, obj[i]); //.value, obj[i].position, obj[i].area, obj[i].appearance);
      }
      this.i = l ; //对应上面
    },
    localSave: function(){
      if( this.i === 0 ){//该语句在处理同域请求会出bug,比如子域没有设置，在从子域跳转到主域时，会清空主域下设置的key
        //改变了key的设置方法，此bug不再存在
        delete localStorage[PAGEURL];
      }else{
        localStorage[PAGEURL] = JSON.stringify( this.dumpItem() );
      }
    },
    localLoad: function(){
      if(!localStorage[PAGEURL]){//这里如果用alert会触发chrome插件的error,因为阻塞了sendMessage的response事件
        //Error in event handler for 'undefined': Cannot call method 'disconnect' of null TypeError: Cannot call method 'disconnect' of null
        setTimeout(function(){ //设置延时解决该bug
          alert('没有可加载的note');
        },10);
        return ;
      }else{
        this.recoverItem( JSON.parse(localStorage[PAGEURL]) );
      }
    }
  }

  /* EditInPlaceField class. 单个标注的实例*/
  function EditInPlaceField(id, parent, config){ //value, position, area, appearance) {
    config = config || {} ;
    this.id = id; //保存的时候使用
    this.title = config.title || plugin.util.getTime() ;
    this.value = config.value || 'default value';
    this.parentElement = parent;
    this.position = config.position || {top:'0px',left:'0px'} ;
    this.area = config.area || { height:'60px'} ;
    this.appearance = config.appearance ;
    this.initNote(this.id);
    //注册组件相关的各种事件
    this.attachEvents();
    /*使大小可调整*/
    this.makeResizeAble();
  };

  EditInPlaceField.prototype = {
    initNote: function(id) {
      this.containerElement = document.createElement('div');
      this.containerElement.id = id;
      this.containerElement.className = '__note__';
      this.containerElement.style.top = this.position.top ;
      this.containerElement.style.left = window.innerWidth / 2 - this.position.left + 'px' ;
      if(this.appearance && (this.appearance.boxShadow != '')){
        this.containerElement.style.boxShadow = this.appearance.boxShadow ;
        this.containerElement.style.borderColor = this.appearance.borderColor;
      }
      this.parentElement.appendChild(this.containerElement);

      /*title*/
      this.titleElement = document.createElement( 'div' );
      this.titleElement.className = '__note-title__';
      this.titleElement.innerHTML = this.title ;
      this.containerElement.appendChild(this.titleElement);

      this.titleEditorElement = document.createElement('input');
      this.titleEditorElement.type = 'text';
      this.titleEditorElement.style.display = 'none' ;
      this.titleEditorElement.className = '__note-title-editor__';
      this.containerElement.appendChild( this.titleEditorElement );
      /*文本显示区域*/
      this.textElement = document.createElement('div');
      this.textElement.className = '__note-text__';
      this.textElement.innerHTML = this.value;
      this.textElement.style.width = this.area.width;
      this.textElement.style.height = this.area.height;
      this.containerElement.appendChild(this.textElement);
      /*编辑器*/
      this.editorElement = document.createElement('textarea');
      this.editorElement.className = '__note-editor__';
      this.containerElement.appendChild(this.editorElement);
      /*确定保存编辑结果按钮*/
      this.saveButton = document.createElement('input');
      this.saveButton.type = 'button';
      this.saveButton.value = 'Save';
      this.containerElement.appendChild(this.saveButton);
      /*取消编辑按钮*/
      this.cancelButton = document.createElement('input');
      this.cancelButton.type = 'button';
      this.cancelButton.value = 'Cancel';
      this.containerElement.appendChild(this.cancelButton);

      this.closeButton = document.createElement('div');
      //this.closeButton.type = 'button';
      //this.closeButton.value = '删除';
      this.closeButton.className = '__note-close__';
      this.containerElement.insertBefore( this.closeButton, this.textElement );

      //this.convertToText();
    },
    attachEvents: function() {
      plugin.util.drag( this.titleElement, this.containerElement );
      var that = this;
      //this.staticElement.onclick = function() { that.convertToEditable() } ;
      this.saveButton.onclick = function() { that.save() } ;
      this.cancelButton.onclick = function() { that.cancel() } ;
      //关闭按钮
      this.closeButton.onmouseover = function() { that.closeButton.style.opacity = '1'; } ;
      this.closeButton.onmouseout = function() { that.closeButton.style.opacity = '0'; } ;
      this.closeButton.onmousedown = function() {
        p.note.saveToolbar();
        p.note.removeItem(that); } ;
      /*标题编辑相关*/
      this.titleElement.ondblclick = function(){
        that.editTitle();
      };
      this.titleEditorElement.onblur = function(){
        that.saveTitle();
      };
      /*正文编辑相关*/
      this.textElement.ondblclick = function(){
        p.note.enterEditMode();
        that.convertToEditable(); }
      /*Edit toolbar*/
      //this.textElement.onclick = function(){
      //  var obj = p.note.getToolbar() ;
      //  that.containerElement.appendChild(obj);
      //
      //  $('#dschoices').click(function(e){
      //    that.containerElement.style.boxShadow = e.target.style.boxShadow ;
      //    that.containerElement.style.borderColor = e.target.style.borderColor;
      //    p.note.toolbarChange();
      //  });
      //}
    },
    makeResizeAble:function(){
      /*水平的控制线*/
      this.bottomControlElement = document.createElement('div');
      this.bottomControlElement.className = '__note-bcontrol__';
      this.containerElement.appendChild( this.bottomControlElement );
      /*左侧控制线*/
      this.leftControlElement = document.createElement('div');
      this.leftControlElement.className = '__note-lcontrol__';
      this.containerElement.appendChild( this.leftControlElement );
      /*左下*/
      this.lbControlElement = document.createElement('div');
      this.lbControlElement.className = '__note-lbcontrol__';
      this.containerElement.appendChild( this.lbControlElement );
      /*右侧的控制线*/
      this.rightControlElement = document.createElement('div');
      this.rightControlElement.className = '__note-rcontrol__';
      this.containerElement.appendChild( this.rightControlElement );
      /*右下方控制*/
      this.rbControlElement = document.createElement('div');
      this.rbControlElement.className = '__note-rbcontrol__';
      this.containerElement.appendChild( this.rbControlElement );

      plugin.util.dragResize( this.bottomControlElement, this.textElement, 'height');
      plugin.util.dragResize( this.leftControlElement, this.textElement, 'leftWidth', this.containerElement );
      plugin.util.dragResize( this.lbControlElement, this.textElement, 'leftWidthHeight', this.containerElement );
      plugin.util.dragResize( this.rightControlElement, this.textElement, 'width');
      plugin.util.dragResize( this.rbControlElement, this.textElement);
    },
    convertToEditable: function() {
      this.saveButton.style.display = 'inline';
      this.cancelButton.style.display = 'inline';

      this.editorElement.value = this.textElement.innerHTML ;
      this.editorElement.focus();
    },
    editTitle: function(){
      this.titleEditorElement.value = this.titleElement.innerHTML ;
      this.titleElement.style.display = 'none';
      this.titleEditorElement.style.display = '';

      this.titleEditorElement.focus();
    },
    saveTitle: function(){
      this.titleElement.innerHTML = this.titleEditorElement.value ;
      this.titleEditorElement.style.display = 'none';
      this.titleElement.style.display = '';
    },
    save: function() {
      this.textElement.innerHTML = this.editorElement.value ;
      p.note.exitEditMode();
    },
    cancel: function() {
      p.note.exitEditMode();
    },
    convertToText: function() {
      this.textElement.style.display = 'none';
      this.saveButton.style.display = 'none';
      this.cancelButton.style.display = 'none';
      this.staticElement.style.display = 'inline';

      this.setValue(this.value);
    },
    fetchConfig: function() {
      var obj = this.textElement ;
      var title = this.titleElement.innerHTML ;
      return {
        title: title,
        value: obj.innerHTML,
          position: {
            top: this.containerElement.style.top,
            left: window.innerWidth / 2 - this.containerElement.style.left.slice(0,-2),
          },
          area: {
            width: obj.style.width,
            height: obj.style.height
          },
          appearance: {
            boxShadow: this.containerElement.style.boxShadow,
            borderColor: this.containerElement.style.borderColor
          }
      }
    },
    removeSelf: function(){
      var obj = this.containerElement;
      obj.parentElement.removeChild(obj);
    },
    setValue: function(value) {
      this.textElement.value = value;
      this.staticElement.innerHTML = value;
    },
    getValue: function() {
      return this.textElement.value;
    }
  };

  plugin.note = note ;
})(p)

p.init();
p.note.init();

/***
 *动态设置css：因为涉及到chrome.extension.getURL()的读取
 *
 */
var imageResource = chrome.extension.getURL('content_scripts/') ;

function loadStyleString(css){
  var style = document.createElement('style');
  style.type = 'text/css' ;
  style.appendChild(document.createTextNode(css));
  var head = document.getElementsByTagName("head")[0] ;
  head.appendChild(style);
}

loadStyleString('#__head-right__ { background: url('+imageResource+'sprite.gif) 0 -56px } '
    +'.__note-close__ {background: url('+imageResource+'sprite.png) 0 298px } '
    +'.showAll {background: url('+imageResource+'sprite.gif) 0 -558px} '
    );
