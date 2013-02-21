var PAGEURL = location.href ;

var p = {} ;

p.init = function(){
  var plugin = document.createElement('div');
  plugin.id = '__plugin__';
  plugin.onselectstart = function(){ return false; }

  plugin.innerHTML =
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

  document.body.appendChild( plugin );

  /**
   *Toggle Max/Min Size
   */
  var pluginId = '#' + plugin.id;
  $('#__head-right__').click(function(){
    if( $(pluginId).css('height') == '25px' ){
      $( pluginId ).css('height','400px')
    $( pluginId ).css('top', $(pluginId).css('top').slice(0,-2) - 375 + 'px')
    $('#__body__').show();
    }else{
      $(pluginId).css('height','25px')
    $( pluginId ).css('top', $(pluginId).css('top').slice(0,-2) - 0  + 375 + 'px')
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

  drag( $('#__head-left__')[0] , plugin )

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

  document.getElementById('showMessage').onclick = function(){
    delete localStorage.marked;
    marked = {} ;
  }

}

p.init();

//给input元素设置下拉菜单
function downselect(obj,choices){
  //var obj = document.getElementById(id);
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
  var displayChange = toggle( objchoices.style , 'display' , 'none' , 'block' );
  objbt.onclick = function(){
    displayChange();
  }
  return displayChange;
  ////按钮 id+'bt' ; 选项列表 id+'choices'
  //objchoices.onclick = function(e){
  //  obj.value = e.target.innerHTML;
  //  displayChange();
  //}
}

//toggle
function toggle( obj,property,state1,state2){
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


/**
 *drag 
 *@param {Element} dragObj 点击的对象
 *@param {Element} moveObj 需要移动的对象
 */
function drag(dragObj, moveObj){
  moveObj = moveObj || dragObj ;
  var startX
    ,startY
    ,stop ;
  //注意此方法是以当前窗口为0px，也就是说如果页面有滚动的话，要加上scrollY值
  moveObj.style.left = moveObj.style.left || moveObj.getBoundingClientRect().left + 'px' ;
  moveObj.style.top =  moveObj.style.top || moveObj.getBoundingClientRect().top +'px' ;

  dragObj.onmousedown = function(e){
    document.onselectstart = function(){ return false };
    //有的时候，dragObj是外层容器，点击其内部会冒泡到它,因此要验证点击的是否是dragObj
    //if( e.target != dragObj ) { return ; }
    startX = e.clientX - moveObj.style.left.split('px')[0] ;
    startY = e.clientY - moveObj.style.top.split('px')[0] ;
    var that = moveObj ;//that为要移动的对象；
    document.onmousemove = function(e){
      that.style.left = e.clientX - startX + 'px' ;
      that.style.top = e.clientY - startY + 'px' ;
    } ;
  }
  document.onmouseup = function(e){
    document.onselectstart = null;
    document.onmousemove = null;
    p.data.localSave();
  }
}

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
 *Save/Recover
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

//注册自动保存事件
window.onunload = function(){
  //for(var mem in marked){
  //  break ;
  //}
  //if( marked[mem]=== undefined ){
  //  return ;
  //}
  //localStorage.marked = JSON.stringify(marked);
  //此处不用判断NOTE.i > 0 ，因为删除事件是在localSave()里面定义的，不然就无法删除最后一个元素了
  p.data.localSave();
}

window.onresize = function(){
  clearTimeout ( arguments.callee.tid );
  arguments.callee.tid = setTimeout(function(){
    //p.data.localSave();
    p.note.init();
  },20)
}

//注册发送事件
$('#sendMessage').click(function(){
  p.data.remoteSave();
})
//注册接收事件
$('#loadMessage').click(function(){
  p.data.remoteLoad();
});

/* EditInPlaceField class. */

function EditInPlaceField(id, parent, value, position, area, appearance) {
  this.id = id; //保存的时候使用
  this.value = value || 'default value';
  this.parentElement = parent;
  this.position = position || {top:'0px',left:'0px'} ;
  this.area = area || {width:'160px', height:'60px'} ;
  this.appearance = appearance ;
  this.createElements(this.id);
  //注册组件相关的各种事件
  this.attachEvents();
};

EditInPlaceField.prototype = {
  createElements: function(id) {
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

    //this.staticElement = document.createElement('span');
    //this.containerElement.appendChild(this.staticElement);
    //this.staticElement.innerHTML = this.value;

    this.fieldElement = document.createElement('textarea');
    this.fieldElement.className = '__note-field__';
    this.fieldElement.value = this.value;
    this.fieldElement.style.width = this.area.width;
    this.fieldElement.style.height = this.area.height;
    this.containerElement.appendChild(this.fieldElement);

    //this.saveButton = document.createElement('input');
    //this.saveButton.type = 'button';
    //this.saveButton.value = 'Save';
    //this.containerElement.appendChild(this.saveButton);    
    //
    //this.cancelButton = document.createElement('input');
    //this.cancelButton.type = 'button';
    //this.cancelButton.value = 'Cancel';
    //this.containerElement.appendChild(this.cancelButton);    

    this.closeButton = document.createElement('div');
    //this.closeButton.type = 'button';
    //this.closeButton.value = '删除';
    this.closeButton.className = '__note-close__';
    this.containerElement.insertBefore( this.closeButton, this.fieldElement );

    //this.convertToText();
  },
  attachEvents: function() {
    drag( this.containerElement );
    var that = this;
    //this.staticElement.onclick = function() { that.convertToEditable() } ;
    //this.saveButton.onclick = function() { that.save() } ;
    //this.cancelButton.onclick = function() { that.cancel() } ;
    //关闭按钮
    this.closeButton.onmouseover = function() { that.closeButton.style.opacity = '1'; } ;
    this.closeButton.onmouseout = function() { that.closeButton.style.opacity = '0'; } ;
    this.closeButton.onmousedown = function() {
      p.note.saveToolbar();
      p.note.removeItem(that); } ;
    this.fieldElement.onclick = function(){
      var obj = p.note.getToolbar() ;
      that.containerElement.appendChild(obj);

      $('#dschoices').click(function(e){
        that.containerElement.style.boxShadow = e.target.style.boxShadow ;
        that.containerElement.style.borderColor = e.target.style.borderColor;
        p.note.toolbarChange();
      });
      //objchoices.onclick = function(e){
      //  obj.value = e.target.innerHTML;
      //  displayChange();
      //}
    }
  },

  convertToEditable: function() {
    this.staticElement.style.display = 'none';
    this.fieldElement.style.display = 'inline';
    this.saveButton.style.display = 'inline';
    this.cancelButton.style.display = 'inline';

    this.setValue(this.value);
    this.fieldElement.focus();
  },
  save: function() {
    this.value = this.getValue();
    var that = this;
    var callback = {
      success: function() { that.convertToText(); },
      failure: function() { alert('Error saving value.'); }
    };
    ajaxRequest('GET', 'save.php?id=' + this.id + '&value=' + this.value, callback);
  },
  cancel: function() {
    this.convertToText();
  },
  convertToText: function() {
    this.fieldElement.style.display = 'none';
    this.saveButton.style.display = 'none';
    this.cancelButton.style.display = 'none';
    this.staticElement.style.display = 'inline';

    this.setValue(this.value);
  },
  fetchConfig: function() {
    var obj = this.fieldElement ;
    return {
      value: obj.value,
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
    this.fieldElement.value = value;
    this.staticElement.innerHTML = value;
  },
  getValue: function() {
    return this.fieldElement.value;
  }
};

//var titleClassical = new EditInPlaceField('titleClassical', document.body , 'Title Here');
//var currentTitleText = titleClassical.getValue();

$('#newNote').click(function(){
  console.log('create!');
  //new EditInPlaceField('null',document.body, new Date(), {top:window.scrollY,left:0});
  p.note.newItem();
  p.note.dumpItem();
});

function HandleNoted(){
  //var notes = {};//私有属性，只能通过this.method函数来访问，详见js设计模式p32
  this.notes = {};
  //this.notesSerial = {};  //这个全局变量导致读和写公用，直接导致bug,其实是无需的
  this.i = 0 ;

  //原型 '<div id="__select__"><input id="ds" class="__input__" type=text ></div>';
  this.toolbar = document.createElement('div');
  this.toolbar.id = '__select__';
  var s = document.createElement('div');
  s.id = 'ds';
  s.className = '__input__';
  s.type = 'text';
  this.toolbar.appendChild(s);
  this.toolbarChange = downselect( s,['#08c','#BD362F','#F89406','#1000CC','#000']);
}

HandleNoted.prototype = {
  saveToolbar: function(){
    if( this.toolbar.parentElement ){
      this.toolbar.parentElement.removeChild(this.toolbar);
    }
  },
  getToolbar: function(){
    return this.toolbar ;
  }
  ,
    newItem: function(){
      this.notes[this.i] = new EditInPlaceField(this.i, 
          document.body, new Date(), {top:window.scrollY+'px',left:'0px'});
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
            document.body, obj[i].value, obj[i].position, obj[i].area, obj[i].appearance);
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

p.note = new HandleNoted();
p.note.init = function(){
  p.note.reset();
  //自动恢复
  if( localStorage[PAGEURL] ){
    p.note.localLoad();
  }
}
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
