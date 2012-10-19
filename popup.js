// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


function click(e) {
  //executeScript()是异步的，因此要通过callback的方法去调用
  //例如要*获得用户当前打开的tab*:chrome.tabs.getSelected();
  //然后对其进行*重定向*:chrome.tabs.update( tabsId , {newURL} );
  //传统的反法是：
  //  var objId = chrome.tabs.getSelected(null);
  //  chrome.tabs.update( objId , {newURL} ) ;
  //然而事实是chrome的很多API都是异步的，在objId语句还没又被返回值赋值时，
  //第二句就已经执行了，这时 objId == undefined 是显然错误的，因此只能用如下方法：
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //chrome.tabs.getSelected(null,function(tab){
  //  chrome.tabs.update(tab.id,{url:'http://www.google.com'});
  //});
  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  chrome.tabs.executeScript(null,
      {code:"document.body.style.backgroundColor='" + e.target.id + "'"});
  window.close();
}

//var notification = webkitNotifications.createNotification(
//  null,'Hello World!','if you can see this message, that means the   notification function works well!'
//  );
//  notification.show();

//这里的document是popup.html的DOM
//要操作当前页面的DOM,只能通过executeScript();实现
document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});

//设置badge颜色
//chrome.browserAction.setBadgeBackgroundColor({color:[0, 200, 0, 100]});
//设置badge变化
var i = 0;
window.setInterval(function() {
  chrome.browserAction.setBadgeText({text:String(i)});
  i++;
}, 300);


chrome.tabs.getSelected(undefined,function(tab){
  var str = '\n'
  for(var mem in tab){
    str += mem+' : '+tab[mem] + '\n';
  }
  alert(str);
});

