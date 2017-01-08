function isString(str) {
  return typeof str === 'string' || str instanceof String;
}

function getObjectKeys(obj) {
  var ret = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) ret.push(key);
  }
  return ret;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}


/**

  spawning an element this way makes life really easy in a lot of ways, but you have to understand a few things to use this to it's fullest potential

  1. element must either be a string, or a type that conforms to : new Type(parent, props, children);

**/

function spawn(element, parent, props, children) {
  var el = document.createElement(element);
  if (props!=undefined) {
    var keys = getObjectKeys(props);
    keys.forEach(function(key) {
      if (isObject(props[key])) {
        var subKeys = getObjectKeys(props[key]);
        subKeys.forEach(function(innerKey) {
          el[key][innerKey] = props[key][innerKey];
        });
      } else {
        el[key] = props[key];
      }
    },this);
  }
  if (parent) {
    if (isString(parent)) {
      var parent = document.getElementById(parent);
      parent && parent.appendChild(el);
    } else if (parent.appendChild) {
      parent.appendChild(el);
    }
  }
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(function(child) {
        el.appendChild(child);
      }, this);
    } else if (isString(children)) {
      el.innerHTML=children;
    } else if (isObject(children)){
      var keys = getObjectKeys(children);
      if (!el.kids) el.kids = {}; // named children
      keys.forEach(function(key){
        el.appendChild(children[key]);
        el.kids[key] = children[key];
      },this);
    } else {
      el.innerHTML=JSON.stringify(children);
    }
  }
  return el;
}

var thatWrapper = function(instance) {
  var that = this;
  if (this!=instance)
    this.that = instance;
  var prototype=Object.getPrototypeOf(instance);
  var keys = getObjectKeys(instance).concat(getObjectKeys(prototype));
  keys.forEach(function(key) {
    if (typeof(instance[key]) === "function") that[key] = instance[key].bind(instance);
  },this);
}

var me = function(instance) {
  if (!instance.transformedInstanceThis) {
    thatWrapper.call(instance, instance);
    instance.transformedInstanceThis=true;
  }
  return instance;
}

var objectAssign = function(destination, source) {
  var parameters = Array.prototype.slice.call(arguments);
  if (Object.assign) {
    return Object.assign.apply(this, parameters);
  }
  var assigns = parameters.slice(1);
  assigns.forEach(function(assign) {
    var keys = getObjectKeys(assign);
    keys.forEach(function(key) {
      destination[key]=assign[key];
    },this);
  },this);
  return destination;
}

function adopt(element, parent) {
  parent.appendChild(element);
}

function abandon(element) {
  console.log('abandon', element, element.parentElement);
  element.parentElement && element.parentElement.removeChild(element);
}

function stopBubble(event) {
  event.cancelBubble = true;
  if(event.stopPropagation) event.stopPropagation();
}

function prependElement(parent,child) {
  if (parent.firstChild!=null) {
    parent.insertBefore(child, parent.firstChild);
  } else{
    parent.appendChild(child);
  }
}

function removeAllChildren(element) {
  while (element && element.lastChild) element.removeChild(element.lastChild);
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
function nodeScriptClone(node) {
  var script  = document.createElement("script");
  script.text = node.innerHTML;
  for( var i = node.attributes.length-1; i >= 0; i-- ) {
    script.setAttribute( node.attributes[i].name, node.attributes[i].value );
  }
  return script;
}
function fixElementScripts(elid) {
  nodeScriptReplace(document.getElementById(elid));
}
function setElementContentWithScripts(element, content) {
  if (element==null)
    return false;
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  element.innerHTML = content;
  nodeScriptReplace(element);
  return true;
}

function findElementZ(elementID) {
  var element = document.getElementById(elementID);
  var zval = 0;

  var curElement = element;
  var foundVal = undefined;

  while(curElement!=undefined) {
    var curZ = curElement.style.zIndex;
    if (curZ!=undefined&&curZ!="") {
      foundVal=parseInt(curZ)
      break;
    }
    curElement=curElement.parentElement;
  }

  if (foundVal!=undefined) {
    zval=foundVal;
  }
  else{
    zval = 0;
  }

  return zval;
}

function getScrollPos() {
  if (document.documentElement.scrollTop!=0) {
    return document.documentElement.scrollTop;
  }
  else if (document.body.scrollTop!=0) {
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

function todayUTC() {
  var d = new Date();
  d.setHours(0,0,0,0);
  return Math.round(d.getTime()/1000);
}

function tomorrowUTC() {
  var d = new Date();
  d.setHours(0,0,0,0);
  return Math.round(d.getTime()/1000)+86400;
}

function makereadable(str) {
  if (str==null)
    return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(?:\r\n|\r|\n)/g, '<br/>').replace(/(?:[\t ])/g, '&nbsp;&nbsp;');
}

function makereadableline(str) {
  if (str==null)
    return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/(?:\r\n|\r|\n)/g, ' ');
}

function limitsize(str,maxchars) {
  return str.substr(str,0,maxchars);
}

function quickdate(unix_timestamp) {
  var date = new Date(unix_timestamp*1000);
  return  (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear();
}

function quickdatetime(unix_timestamp) {
  var date = new Date(unix_timestamp*1000);
  return  (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + (date.getMinutes().toString().length==1?'0':'') + date.getMinutes();
}

function getUnixNow() {
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