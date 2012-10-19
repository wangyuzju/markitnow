function genURL(action){
  return 'http://markitnow.sinaapp.com/'+action+'.php';
}
var URL={
  'save': genURL('save'),
  'load': genURL('load')
}

chrome.browserAction.onClicked.addListener(function() {
});
/**tabs.onUpdated 新建tab事件
 *注册新建tab事件{{{
 *@param {Number} tabId
 *@param {Object} changeInfo{status, pinned, url如果tab的URL发生改变}
 *@param {Tab} tab 
 *新建一个tab，1.url从无变成有而触发，2.status从loading变成complete触发 共两次
 */
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  //过滤页面加载完成事件
  if( changeInfo.url == undefined ) return ;
  //alert(changeInfo.url);
  //hrGet(URL.load);
});//}}}



/**chrome.tabs.onRemoved
 *注册tab关闭事件{{{
 *@param {tabid}
 *@param {removeInfo} .isWindowClosing 判断是tab关闭还是窗口关闭
 */
//chrome.tabs.onRemoved.addListener(function(tabId, info){
//  alert(tabId);
//  var str = '';
//  for( var mem in info ){
//    str += mem + ':' + info[mem] ;
//  }
//  alert(str);
//});//}}}
/**chrome.extension.onMessage
 *注册接收message事件{{{
 *@param {String} request 接收到的字符串
 *@param {Object} sender{tab:{active,highlighted,id,incognito,index,pinned,selected,status,titile,url,windowId}
 *                       ,id:"插件id"}
 *@param {function} sendResponse() 发送响应字符串
 */
chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
  var url = sender.tab.url;
  var value = request ;
  if(value == 'load'){//加载服务器数据
    xhrGet(URL.load+'?load='+encodeURIComponent(url), sendResponse );
  }else{//请求服务器保存
    xhrPost(URL.save, 'url='+encodeURIComponent(url)+'&marked='+value, function(xhr){
      sendResponse({success:'true'});
    });
  }
  return true;//想要将sendResponse传递给ajax处理函数处理ajax接收到的请求时(异步)，这里必须要返回ture
});//}}}
/**xhrPost
 *发送接收到的数据到服务器函数{{{
 *
 */
function xhrPost(url, data, fn){
  if(!data){
    return ;
  }
  var xhr = new XMLHttpRequest();
  //设置header才会被服务器当成post数据
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4){
      if( xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
        alert(xhr.responseText);
      }
    }
  }
  xhr.open('POST',url);
  xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  xhr.send(data);
}//}}}
/**xhrGet
 *{{{
 */
function xhrGet(url, fn){
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function(){
    if(xhr.readyState == 4){
      if( xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
        fn(xhr.responseText);
      }
    }
  }
  xhr.open('GET',url);
  xhr.send(null);
}//}}}
