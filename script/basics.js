function isString(str) {
  return typeof str === 'string' || str instanceof String;
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function isFunc(obj) {
  return Object.prototype.toString.call(obj) === '[object Function]'
}

function isNode(o) {
  return (typeof Node === "object" ? o instanceof Node :
    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string");
}

function isElement(o) {
  return (typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string");
}

function isArray(ray) {
  return Object.prototype.toString.call(ray) === '[object Array]';
}

function getObjectKeys(obj) {
  var ret = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) ret.push(key);
  }
  return ret;
}

function getEvaluatedString(str) {
  var exp = new RegExp('`', 'g');
  var escaped = `\`${str.replace(exp,'\\`')}\``;
  var ret = eval(escaped);
  return ret;
}

function arrayMove(array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0]);
}

// https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function b64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function addButtonCallback(element, callback, keycode) {
  element.addEventListener("keyup", function(event) {
    if (event.keyCode === (keycode || 13)) {
      callback&&callback(event, element);
    }
  });
}

function applyPropsToElement(el, props) {
  if (props!=undefined) {
    var keys = getObjectKeys(props);
    keys.forEach(function(key) {
      if (isObject(props[key])) {
        var subKeys = getObjectKeys(props[key]);
        if (!el[key]) el[key] = {};
        subKeys.forEach(function(innerKey) {
          el[key][innerKey] = props[key][innerKey];
        });
      } else {
        el[key] = props[key];
      }
    },this);
  }
}

function applyChildrenToElement(el, children) {
  if (children) {
    if (Array.isArray(children)) {
      children.forEach(function(child) {
        var tempchild = isElement(child) ? child : child.view;
        if (tempchild) el.appendChild(tempchild);
      }, this);
    } else if (isString(children)) {
      el.value=children;
      el.innerHTML=children;
    } else if (isObject(children)) {
      var keys = getObjectKeys(children);
      if (!el.kids) el.kids = {}; // named children
      keys.forEach(function(key) {
        var child = isElement(children[key]) ? children[key] : children[key].view;
        if (child) {
          el.appendChild(child);
          el.kids[key] = child;
        }
      },this);
    } else {
      el.innerHTML=JSON.stringify(children);
    }
  }
}

function spawn(element, parent, props, children) {
  var el = null;
  if (isString(element)) {
    el = document.createElement(element);
    adopt(parent, el);
    applyChildrenToElement(el, children);
  } else if (isFunc(element)) {
    el = new element(parent, props);
    if (el && el.view) {
      applyChildrenToElement(el.view, children);
    }
  } else {
    return null;
  }
  applyPropsToElement(el, props);
  return el;
}

function spawnFromHtml(code, parent, props, children) {
  var tmp = spawn('div', null, {}, code);
  if (tmp.children.length === 1) {
    var el = tmp.children[0];
    applyPropsToElement(el, props);
    adopt(parent, el);
    applyChildrenToElement(el, children);
    return el;
  }
  return undefined;
}

function getChildren(element) {
  if (isElement(element)) {
    return [].slice.call(element.children);
  } else if (isElement(element.view)) {
    return [].slice.call(element.view.children);
  }
  return [];
}

function getRecursiveChildren(element, depth) {
  if (depth === undefined) depth = 0;
  if (depth > 10) return [];
  var kids = getChildren(element);
  var ret = kids;
  kids.forEach(function(child) {
    ret = ret.concat(getRecursiveChildren(child, depth++));
  });
  return ret;
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

var me = function(instance, props) {
  if (!instance.transformedInstanceThis) {
    thatWrapper.call(instance, instance);
    instance.transformedInstanceThis=true;
  }
  if (props) {
    objectAssign(instance, props);
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

function getView(element) {
  return isElement(element) ? element : element && element.view;
}

function adopt(parent, element) {
  if (parent) {
    if (isString(parent)) {
      var parent = document.getElementById(parent);
      parent && parent.appendChild(element);
    } else if (parent.appendChild) {
      parent.appendChild(element);
    }
  }
}

function abandon(element) {
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
    try {
      const xhr = typeof XMLHttpRequest !== 'undefined'
      ? new XMLHttpRequest()
      : new window.ActiveXObject('Microsoft.XMLHTTP');
      xhr.onerror = (err) => {reject(err);};
      xhr.open(verb, url, true);

      headers && Object.keys(headers).forEach(key => xhr.setRequestHeader(key, headers[key]));

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          const status = xhr.status;
          if (status >= 200 && status <= 300) {
            try {
              resolve(xhr.responseText);
            } catch (err) {
              reject(err.message + xhr.responseText);
            }
          } else {
            if (xhr.status === 0) {
              reject(new Error('Request error, check your console, possibly a url misconfiguration (did you forget http?)- you tried to access ' + url + ' ' + verb));
            } else {
              reject(xhr);
            }
          }
        }
      };
      xhr.send(params);
    } catch (err) {
      reject(err);
    }
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

function setLocal(key, value) {
  return localStorage.setItem(key, value);
}

function getLocal(key) {
  return localStorage.getItem(key);
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

function getElementScroll(elem) {
  return { x: elem.pageXOffset || elem.scrollLeft, y: elem.pageYOffset || elem.scrollTop };
}

function getElementSize(elem) {
  var box = elem.getBoundingClientRect();
  return { w: box.right - box.left, h: box.bottom - box.top };
}

function getOffsetRect(elem) {
  var box = elem.getBoundingClientRect();
  var body = document.body;
  var docElem = document.documentElement;
  var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
  var clientTop = docElem.clientTop || body.clientTop || 0;
  var clientLeft = docElem.clientLeft || body.clientLeft || 0;
  var top  = box.top +  scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return { x: Math.round(left), y: Math.round(top), w: box.right - box.left, h: box.bottom - box.top };
}

function getPositionInParent(elem) {
  if (elem && elem.parentElement) {
    var elemOff = getOffsetRect(elem);
    var parOff = getOffsetRect(elem.parentElement);
    var parScroll = getElementScroll(elem.parentElement);
    return { x: elemOff.x - parOff.x + parScroll.x, y: elemOff.y - parOff.y + parScroll.y, w: elemOff.w, h: elemOff.h };
  }
  return undefined;
}

function getPositionInAncestor(elem, ancestor) {
  if (ancestor === elem || elem === null) {
    return { x: 0, y: 0};
  }
  var pos = getPositionInParent(elem, ancestor, elem.parentElement);
  var recursed = getPositionInAncestor(elem.parentElement, ancestor);
  var box = elem.getBoundingClientRect();
  return { x: pos.x + recursed.x, y: pos.y + recursed.y, w: box.right - box.left, h: box.bottom - box.top };
}

function getRelativeMousePos(elem) {
  var mouse = getMousePos();
  var off = getOffsetRect(elem);
  return {x: mouse.x - off.x, y: mouse.y - off.y};
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

function randomString() {
  var chars = []; // 97 - 122 lower case // 65 - 90 upper case
  for(var a = 0; a < Math.floor(Math.random() * 10) + 5; a++) {
    chars.push(Math.floor(Math.random() * (122 - 97)) + 97);
  }

  return String.fromCharCode.apply(this, chars);
}

function keyCallBack(a,e) {
  var event = e || window.event;
  var charCode = event.which || event.keyCode;

  if ( charCode == '13' ) {
    a&&a();
    return false;
  }
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

encodeURIObject = function(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function formatDate(date) {
  return  (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear();
}

function formatDateWeek(date) {
  return  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()] + " " + (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear();
}

function formatDateTime(date) {
  return  (date.getMonth()+1) +"/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + (date.getMinutes().toString().length==1?'0':'') + date.getSeconds();
}

function formatDateSane(date) {
  if (!date) return '?/? ?:?? ??';
  var hours;var pm;
  if (date.getHours() < 12) {
    pm = 'AM';
    if (date.getHours() === 0) hours = 12;
    else hours = date.getHours();
  } else {
    pm = 'PM';
    hours = date.getHours() - 12;
  }
  return  (date.getMonth()+1) +"/" + date.getDate() + " " + hours + ":" + (date.getMinutes().toString().length==1?'0':'') + date.getMinutes() + ' ' + pm;
}

function getClassState(obj, keys) {
  return (keys || []).reduce((state, key) => {
    if (key in obj) {
      if ('value' in obj[key]) {
        state[key] = obj[key].value;
      }/* else if ('innerHTML' in obj[key]) {
        state[key] = obj[key].innerHTML;
      } */else if ('getState' in obj[key]) {
        state[key] = obj[key].getState();
      }
    }
    return state;
  }, {});
}

function setClassState(obj, state) {
  return (getObjectKeys(state) || []).forEach((key) => {
    if (obj.customStateCallback) {
        obj.customStateCallback(obj, state, key);
    } else if (key in obj) {
      if ('value' in obj[key]) {
        obj[key].value  = state[key];
      }/* else if ('innerHTML' in obj[key]) {
        obj[key].innerHTML  = state[key];
      } */else if ('setState' in obj[key]) {
        obj[key].setState(state[key]);
      }
    }
    return state;
  }, {});
}

function getAutoState(obj) {
  var keys = getObjectKeys(obj).filter(function(key) {
    return (isObject(obj[key]) || isElement(obj[key]));
  });
  return getClassState(obj, keys);
}

function setAutoState(obj, state) {
  setClassState(obj, state);
}

function mixinAutoState(obj) {
  obj.getState = function() {
    return getAutoState(obj);
  }
  obj.setState = function(state) {
    setAutoState(obj, state);
  }
}

function upperFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function upperAllFirst(str) {
  return str.split(' ').map(function(st) {
    return upperFirst(st);
  }).join(' ');
}

function replacex(source, find, replace, flags, originalSource, level) {
  if (flags === undefined) flags = 'ig';
  if (level === undefined) level = 0;
  if (source === originalSource) return source;
  if (originalSource === undefined) originalSource = source;

  if (isString(source)) {
    var exp = new RegExp(find, flags);
    return source.replace(exp, replace);
  } else if (isArray(source)) {
    return source.map(function(cur){return replacex(cur, find, replace, flags, originalSource, level+1)});
  } else if (isObject(source)) {
    var keys = getObjectKeys(source);
    return keys.reduce(function(results, cur){
      results[cur]=replacex(source[cur], find, replace, flags, originalSource, level+1); // leaving the keys alone
      // results[replacex(cur, find, replace, flags, originalSource, level+1)]=replacex(source[cur], find, replace, flags, originalSource, level+1);
      return results;
    }, {});
  } else {
    return source;
  }
}
