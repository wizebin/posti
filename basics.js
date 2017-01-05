
function addQuickElement(parent, element, content, props, children){
  var el = document.createElement(element);
  if (content!=undefined)
    el.innerHTML=content;
  if (props!=undefined){
    // Object.assign(el, props);

    var keys = getObjectKeys(props);
    keys.forEach(function(key){
      if (Object.prototype.toString.call(props[key]) === '[object Object]') {
        var subKeys = getObjectKeys(props[key]);
        subKeys.forEach(function(innerKey){
          el[key][innerKey] = props[key][innerKey];
        });
      } else {
        el[key] = props[key];
      }
    },this);
  }
  parent && parent.appendChild(el);
  children && children.forEach(function(child){
    el.appendChild(child);
  },this);
  return el;
}

function prependElement(parent,child){
  if (parent.firstChild!=null){
    parent.insertBefore(child, parent.firstChild);
  } else{
    parent.appendChild(child);
  }
}

function removeAllChildren(element){
  while (element && element.lastChild) element.removeChild(element.lastChild);
}

function getObjectKeys(obj){
  var ret = [];
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    ret.push(key);
  }
  return ret;
}

const httpVERB = (url, verb, params, headers) => {
  return new Promise((resolve, reject) => {
    const xhr = typeof XMLHttpRequest !== 'undefined'
    ? new XMLHttpRequest()
    : new window.ActiveXObject('Microsoft.XMLHTTP');
    xhr.open(verb, url, true);

    headers && Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const status = xhr.status;
        if (status === 200) {
          try {
            resolve(xhr.responseText);
          } catch (err) {
            reject(err.message + xhr.responseText);
          }
        } else {
          reject(xhr.statusText);
        }
      }
    };
    xhr.send(params);
  });
};

//parses JSON from response string
var jsonVERB = function(url, verb, params, username, password, successHandler, errorHandler){
  return httpVERB(url,verb,params,username,password,
  function(data){
  try{
    successHandler&&successHandler(JSON.parse(data));
  }
  catch(err){
    errorHandler && errorHandler("Error In jsonVERB (PROBABLY A SERVER JSON MISCONFIGURATION) Message("+err.message+") Data("+data+")");
  }
  },
  function(data){
  errorHandler && errorHandler("jsonVERB ERR: "+data);
  });
}

//convenience http methods

var postJSON = function(url, params, successHandler, errorHandler) {
  return jsonVERB(url,'POST',params,null,null,successHandler, errorHandler);
};
var getJSON = function(url, successHandler, errorHandler) {
  return jsonVERB(url, 'GET', null,null,null,successHandler, errorHandler);
};
var putJSON = function(url, params, successHandler, errorHandler){
  return jsonVERB(url,'PUT',params,null,null, successHandler, errorHandler);
}
var patchJSON = function(url, params, successHandler, errorHandler){
  return jsonVERB(url,'PUT',params,null,null,successHandler, errorHandler);
}
var deleteJSON = function(url, successHandler, errorHandler){
  return jsonVERB(url,'DELETE',null,null,null,successHandler, errorHandler);
}

var postHTTP = function(url, params, username, password, successHandler, errorHandler) {
  return httpVERB(url,'POST',params,username,password,successHandler, errorHandler);
};
var getHTTP = function(url, username, password, successHandler, errorHandler) {
  return httpVERB(url, 'GET', null,username,password,successHandler, errorHandler);
};
var putHTTP = function(url, username, password, params, successHandler, errorHandler){
  return httpVERB(url,'PUT',params,username,password, successHandler, errorHandler);
}
var patchHTTP = function(url, username, password, params, successHandler, errorHandler){
  return httpVERB(url,'PUT',params,username,password,successHandler, errorHandler);
}
var deleteHTTP = function(url, username, password, successHandler, errorHandler){
  return httpVERB(url,'DELETE',null,username,password,successHandler, errorHandler);
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  if (exdays==undefined)exdays=15;
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return null;
}

//http://stackoverflow.com/a/20584396
function nodeScriptReplace(node) {
  if ( nodeScriptIs(node) === true ) {
    node.parentNode.replaceChild( nodeScriptClone(node) , node );
  }
  else {
    var i = 0;
    var children = node.childNodes;
    while ( i < children.length ) {
      nodeScriptReplace( children[i++] );
    }
  }
  return node;
}
function nodeScriptIs(node) {
  return node.tagName === 'SCRIPT';
}
function nodeScriptClone(node){
  var script  = document.createElement("script");
  script.text = node.innerHTML;
  for( var i = node.attributes.length-1; i >= 0; i-- ) {
    script.setAttribute( node.attributes[i].name, node.attributes[i].value );
  }
  return script;
}
function fixElementScripts(elid){
  nodeScriptReplace(document.getElementById(elid));
}
function setElementContentWithScripts(element, content){
  if (element==null)
    return false;
  if (typeof element === 'string'){
    element = document.getElementById(element);
  }
  element.innerHTML = content;
  nodeScriptReplace(element);
  return true;
}
function showBlock(obj){
  document.getElementById(obj).style.display="block";
}
function hide(obj){
  document.getElementById(obj).style.display="none";
}
function findElementZ(elementID){
  var element = document.getElementById(elementID);
  var zval = 0;

  var curElement = element;
  var foundVal = undefined;

  while(curElement!=undefined){
    var curZ = curElement.style.zIndex;
    if (curZ!=undefined&&curZ!=""){
      foundVal=parseInt(curZ)
      break;
    }
    curElement=curElement.parentElement;
  }

  if (foundVal!=undefined){
    zval=foundVal;
  }
  else{
    zval = 0;
  }

  return zval;
}
function addDropdownToParentDirectional(setid, parent, content, matchParentWidthIfPossible,anchorCSS,flowCSS, zval){
  if(anchorCSS==undefined){
    anchorCSS='left:0px;bottom:0px;';
  }
  if (flowCSS==undefined){
    flowCSS='top:0px;left:0px;';
  }
  var zval = findElementZ(parent) + 1;

  var html = '<div id="'+setid+'" style="position:absolute;box-sizing:border-box;z-index:'+zval+';'+flowCSS+(matchParentWidthIfPossible?'min-width:100%;':'')+'">'+content+'</div>';

  var element = document.getElementById(parent);

  var newid = parent + 'dropdown';
  element.onmouseover=function(){showBlock(newid);};
  element.onmouseout=function(){hide(newid);};
  element.position="relative";
  var toadd = document.createElement('div');
  toadd.id=newid;
  toadd.setAttribute("style","position:absolute;"+anchorCSS+"z-index:"+zval);
  toadd.onclick=function (evt){evt.cancelBubble = true;if(evt.stopPropagation) evt.stopPropagation();};
  toadd.innerHTML=html;
  element.appendChild(toadd);
  hide(newid);
}
function changeParent(elementID,parentID){
  var element = document.getElementById(elementID);
  element.style.zIndex=findElementZ(parentID)+1;
  document.getElementById(parentID).appendChild(element);
}
function addDropdownToParent(setid, parent, content, matchParentWidthIfPossible, zval){
  addDropdownToParentDirectional(setid,parent,content,matchParentWidthIfPossible,'right:0px;bottom:0px;','right:0px;top:0px;');
}
function addDropdownBelowLeft(setid, parent, content, matchParentWidthIfPossible, zval){
  addDropdownToParentDirectional(setid,parent,content,matchParentWidthIfPossible,'right:0px;bottom:0px;','right:0px;top:0px;');
}
function addDropdownBelowRight(setid, parent, content, matchParentWidthIfPossible, zval){
  addDropdownToParentDirectional(setid,parent,content,matchParentWidthIfPossible,'left:0px;bottom:0px;','left:0px;top:0px;');
}
function addDropdownAboveLeft(setid, parent, content, matchParentWidthIfPossible, zval){
  addDropdownToParentDirectional(setid,parent,content,matchParentWidthIfPossible,'right:0px;top:0px;','right:0px;bottom:0px;');
}
function addDropdownAboveRight(setid, parent, content, matchParentWidthIfPossible, zval){
  addDropdownToParentDirectional(setid,parent,content,matchParentWidthIfPossible,'left:0px;top:0px;','left:0px;bottom:0px;');
}
//Return current body scroll pos
function getScrollPos(){
  if (document.documentElement.scrollTop!=0){
    return document.documentElement.scrollTop;
  }
  else if (document.body.scrollTop!=0){
    return document.body.scrollTop;
  }
  return 0;
}
function getPageWidth() {
  if (self.innerHeight) {
  return self.innerWidth;
  }
  if (document.documentElement && document.documentElement.clientHeight) {
  return document.documentElement.clientWidth;
  }
  if (document.body) {
  return document.body.clientWidth;
  }
}

function valOrOther(val,other){
  if (val!=null)
    return val;
  return other;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function keyCallBack(a,e) {
  var event = e || window.event;
  var charCode = event.which || event.keyCode;

  if ( charCode == '13' ) {
    a&&a();
    return false;
  }
}

function todayUTC(){
  var d = new Date();
  d.setHours(0,0,0,0);
  return Math.round(d.getTime()/1000);
}
function tomorrowUTC(){
  var d = new Date();
  d.setHours(0,0,0,0);
  return Math.round(d.getTime()/1000)+86400;
}

function makereadable(str){
  if (str==null)
    return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(?:\r\n|\r|\n)/g, '<br/>').replace(/(?:[\t ])/g, '&nbsp;&nbsp;');
}
function makereadableline(str){
  if (str==null)
    return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(?:\r\n|\r|\n)/g, ' ');
}

function limitsize(str,maxchars){
  return str.substr(str,0,maxchars);
}
function quickdate(unix_timestamp){
  var date = new Date(unix_timestamp*1000);
  return  (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear();
}
function quickdatetime(unix_timestamp){
  var date = new Date(unix_timestamp*1000);
  return  (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + (date.getMinutes().toString().length==1?'0':'') + date.getMinutes();
}
function getUnixNow(){
  return Math.round((new Date().getTime())/1000);
}
function randomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getInitials(inname){
  if (inname==null)
    return '';
  var fromsplit = inname.split(' ');
  var ret = '';
  for(var a = 0; a < fromsplit.length; a++){
    ret += fromsplit[a].charAt(0);
  }
  return ret;
}
String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\\\/g,"\\\\")
         .replace(/\\n/g, "\\n")
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
};