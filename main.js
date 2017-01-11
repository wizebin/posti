var errorList = [];

function getEvaluatedString(str) {
  var escaped = `\`${str.replace('`','\\`')}\``;
  // try {
    var ret = eval(escaped);
    return ret;
  // } catch (err) {
  //   errorList.push(err);
  //   console.error('error in string evaluation', str, 'err');
  //   return str;
  // }
}

function getObjectAsHeaderArray(obj) {
  var keys = getObjectKeys(obj);
  return keys.reduce(function(culm, key) {
    culm.push(`${key}: ${obj[key]}`);
    return culm;
  },[]);
}

var ToggleButton = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'toggleView', onclick: that.onClick });
  this.toggled = this.props.toggled || true;
  this.showToggledState();
}

ToggleButton.prototype.setToggleState = function(toggled) {
  this.toggled = toggled;
  this.showToggledState();
}

ToggleButton.prototype.getValue = function() {
  return this.toggled;
}

ToggleButton.prototype.showToggledState = function() {
  if (this.toggled) {
    if (this.props.onClass) {
      this.view.className = this.props.onClass;
      this.view.innerHTML = '&#10003;';
    }
  } else {
    if (this.props.offClass) {
      this.view.className = this.props.offClass;
      this.view.innerHTML = '';
    }
  }
}

ToggleButton.prototype.onClick = function() {
  this.setToggleState(!this.getValue());
  this.props.onclick && this.props.onclick(this.toggled);
}

var Timeline = function(parent, props) {
  var that = me(this);
  this.view = spawn('div', parent, objectAssign({ className: 'timelineview' }, props));

  this.cards = [];

  this.cardCounter = 0;

  this.controlView = spawn('div', this.view, { className: 'maincontrols' });
  this.controlRow = spawn('div', this.controlView, { className: 'buttoncontrols' });

  this.cardView = spawn('div', this.view, { className: 'cardwrapper' });

  this.addButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.addCard();
  } }, 'Add Step');

  this.actButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.act();
  } }, 'Perform');

  this.link = spawn('a', this.controlView, { className: 'statelink', onmouseover: function(){that.setStateLink()}, onfocus: function(){that.setStateLink()}}, 'State Link');

  this.addCard('CONFIG');
}


var Card = function(parent, props) {
  var that = me(this);
  this.props = objectAssign({ className: 'cardview' }, props);
  if (this.props.draggable) {
    this.canDrag = true;
  }
  this.view = spawn('div', parent, this.props);
  this.errorView = spawn('div', this.view, { className: 'errorview', style: { display: 'none'}}, [
    this.errorContent = spawn('div', null, { className: 'errorcontent' }),
  ]);

  this.header = spawn('div', this.view, { className: 'cardheader' }, [
    this.options = spawn('select', null, { className: 'cardselect', onchange: function() {
      that.showContent(this.value);
    }}, [
      spawn('option', null, null, 'REQUEST'),
      spawn('option', null, null, 'ACT'),
      spawn('option', null, null, 'CONFIG'),
      spawn('option', null, null, 'DISPLAY'),
    ]),
    this.closer = spawn('button', null, { className: 'cardclose', onclick: function() {
      that.props.onClose && that.props.onClose(that);
    } }, 'Delete Step'),
    this.toggle = new ToggleButton(null, { toggled: true, onClass: 'toggleon', offClass: 'toggleoff' }),
  ]);
  this.content = spawn('div', this.view, { className: 'cardcontent', style: { padding: '10px' } });
  if (this.props.initialCard) this.options.value = this.props.initialCard;
  this.options.onchange();
  window.addEventListener ("mouseup", function () {that.unlockDrag()}, false);
}

var ConfigCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'configview' });
  this.body = spawn('div', this.view, { className: 'configbody' });
  this.configLines = []; // not strictly necessary, could iterate over the body children, but I like this better
  this.addConfigLine();
  this.controlView = spawn('div', this.view, { className: 'configcontrolview' }, [
    spawn('button', null, { className: 'configadd', onclick: function() {that.addConfigLine()} }, this.props.addText || 'Add Row'),
  ]);
}


ConfigCard.prototype.addConfigLine = function(defaultKey, defaultVal) {
  var that = me(this);
  this.configLines.push(spawn('div', this.body, { className: 'configline', style: { display: 'flex' } }, {
    key: spawn('input', null, { className: 'configkey', style: { flex: '1' }, value:defaultKey || '', placeholder: this.props.keyText || 'key', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()}}),
    val: spawn('input', null, { className: 'configval', style: { flex: '1' }, value:defaultVal || '', placeholder: 'value', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} }),
    deleteButton: spawn('button', null, { className: 'configdelete', onclick: function() {that.removeConfigLine(this.parentElement)} }, 'x'),
  }));
}

ConfigCard.prototype.removeConfigLine = function(configLine, force) {
  abandon(configLine);
  var position = this.configLines.indexOf(configLine);
  if (position !== -1) {
    this.configLines.splice(position, 1);
  }
  if (this.configLines.length === 0 && !force) {
    this.addConfigLine();
  }
}

ConfigCard.prototype.getValue = function(evaluate) {
  var ret = {};
  this.configLines.forEach(function(line) {
    var key = line.kids['key'].value;
    var val = line.kids['val'].value;
    if (key && key.length > 0) {
      ret[key] = evaluate ? getEvaluatedString(val) : val;
    }
  },this);
  return ret;
}

// This is duplicated intentionally
ConfigCard.prototype.evaluateAndSetConfig = function() {
  var ret = {};
  this.configLines.forEach(function(line) {
    var key = line.kids['key'].value;
    var val = line.kids['val'].value;
    if (key && key.length > 0) {
      ret[key] = getEvaluatedString(val);
      window.config[key]=ret[key];
    }
  },this);
  return ret;
}

ConfigCard.prototype.getOrderedValue = function(evaluate) {
  var ret = [];
  this.configLines.forEach(function(line) {
    var key = line.kids['key'].value;
    var val = line.kids['val'].value;
    if (key && key.length > 0) {
      ret.push({key, value: evaluate ? getEvaluatedString(val) : val});
    }
  },this);
  return ret;
}

ConfigCard.prototype.act = function() {
  if (!window.config) window.config = {};
  try{
    var result = this.evaluateAndSetConfig();
    return Promise.resolve(result);
  } catch (err) {
    return Promise.reject(err);
  }
}

ConfigCard.prototype.clear = function(force) {
  for(var a = this.configLines.length - 1; a >= 0; a--) {
    this.removeConfigLine(this.configLines[a], force);
  }
}

ConfigCard.prototype.saveState = function() {
  return this.getOrderedValue(false); // don't evaluate the values
}

ConfigCard.prototype.loadState = function(state) {
  this.clear(state.length > 0);
  state.forEach(function(line){
    this.addConfigLine(line.key, line.value);
  }, this);
}

DisplayCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'displayview' });
  this.subject = spawn('input', this.view, { className: 'displayinput', placeholder: 'toDisplay (defaults to last results)', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()}});
  this.display = spawn('textarea', this.view, { className: 'displayoutput', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} });
}

DisplayCard.prototype.act = function() {
  try {
    this.display.value = this.subject.value ? eval(this.subject.value) : JSON.stringify(window.lastResult, null, 4);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

DisplayCard.prototype.clear = function() {
  this.subject.value = '';
  this.display.value = '';
}

DisplayCard.prototype.saveState = function() {
  return {subject: this.subject.value};
}

DisplayCard.prototype.loadState = function(state) {
  this.clear();
  this.subject.value = state.subject;
}


ScriptCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'scriptview', style: { backgroundColor: '#eee', color: '#fff' } });
  this.text = spawn('textarea', this.view, { className: 'scripttext', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} });
}

ScriptCard.prototype.act = function() {
  try{
    var result = eval(this.getValue());
    window.lastResult = result;
  } catch (err) {
    return Promise.reject(err);
  }
  return Promise.resolve(result);
}

ScriptCard.prototype.getValue = function() {
  return this.text.value;
}

ScriptCard.prototype.saveState = function() {
  return {script: this.text.value};
}

ScriptCard.prototype.loadState = function(state) {
  this.text.value = (state && state.script) || '';
}


RequestCard = function(parent, props) {
  var that = me(this);
  this.props=props;
  this.view = spawn('div', parent, { className: 'requestview' });
  this.header = spawn('div', this.view, { className: 'requestheader' }, [
    this.verb = spawn('select', null, { className: 'requestverb', onchange: function() {
      // that.showContent(this.value);
    }}, [
      spawn('option', null, null, 'GET'),
      spawn('option', null, null, 'POST'),
      spawn('option', null, null, 'PATCH'),
      spawn('option', null, null, 'PUT'),
      spawn('option', null, null, 'DELETE'),
    ]),
    this.url = spawn('input', null, { className: 'requesturl', placeholder: 'url', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} }),
    this.mime = spawn('select', null, { className: 'requestmime', onchange: function() {
      that.setBodyType(this.value);
    }}, [
      spawn('option', null, null, 'Form'),
      spawn('option', null, null, 'Raw'),
      spawn('option', null, null, 'Json'),
      // spawn('option', null, null, 'Xml'),
    ]),
  ]);
  this.headerWrap = spawn('div', this.view, { className: 'headerbody' });
  this.headers = new ConfigCard(this.headerWrap, {addText: 'Add Header', keyText: 'Header', lockDrag: this.props.lockDrag, unlockDrag: this.props.unlockDrag});
  this.body = spawn('div', this.view, { className: 'requestbody' });
  this.footer = spawn('div', this.view, { className: 'requestfooter', });

  this.verb.onchange();
  this.mime.onchange();
}

RequestCard.prototype.getParameters = function() {

  var headers = this.headers.getValue(true);
  if (!headers['Content-Type']) {
    if (this.mime.value === 'Form') headers['Content-Type'] = 'application/x-www-form-urlencoded';
    else if (this.mime.value === 'Json') headers['Content-Type'] = 'application/json';
    else if (this.mime.value === 'Xml') headers['Content-Type'] = 'application/xml';
  }

  return {
    'url': getEvaluatedString(this.url.value),
    'verb': this.verb.value || 'GET',
    'headers': getObjectAsHeaderArray(headers),
    'parameters': this.bodyType === 'Form' ? encodeURIObject(this.bodyCard.getValue(true)) : getEvaluatedString(this.bodyCard.getValue()),
    'mime': this.mime.value,
    // 'username': this.username,
    // 'password': this.password,
  };
}

RequestCard.prototype.request = function() {
  return httpVERB('request/', 'POST', JSON.stringify(this.getParameters()), null);
}

RequestCard.prototype.act = function() {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.request().then(function(data) {
      if (that.mime.value==='Json') {
        try{
          var parsed = JSON.parse(data);
          window.lastResult = parsed;
          resolve(parsed);
          return;
        } catch (err) {
          reject(err);
        }
      }
      window.lastResult = data;
      resolve(parsed);
    });
  });
}

RequestCard.prototype.saveState = function() {
  return {verb: this.verb.value, url: this.url.value, mime: this.mime.value, headers: this.headers.saveState(), bodyType: this.bodyType, body: this.bodyCard && this.bodyCard.saveState()};
}

RequestCard.prototype.loadState = function(state) {
  if (!state) state = {};
  this.verb.value = state.verb || '';
  this.url.value = state.url || '';
  this.mime.value = state.mime || 'Form';
  this.headers.loadState(state.headers);
  this.setBodyType(state.bodyType || this.mime.value);
  this.bodyCard.loadState(state.body || {});
}

RequestCard.prototype.setBodyType = function(type) {
  if (this.bodyCard) {
    if (this.bodyType == type) return;
    if (this.bodyType == 'Form') {
      this.lastData = this.bodyCard.getOrderedValue(false);
    } else {
      var parsed = JSON.parse(this.bodyCard.getValue(false));
      var keys = getObjectKeys(parsed);
      this.lastData = keys.map(function(key){
        return { key, value: parsed[key] };
      }, this);
    }
    abandon(this.bodyCard.view);
    this.bodyCard = null;
  }
  this.bodyType = type;
  if (type === 'Form') {
    this.bodyCard = new ConfigCard(this.body, { addText: 'Add Body Parameter', keyText: 'Body Parameter', lockDrag: this.props.lockDrag, unlockDrag: this.props.unlockDrag});
    if (this.lastData) {
      this.bodyCard.loadState(this.lastData);
      this.lastData = null;
    }
  } else {
    this.bodyCard = new ScriptCard(this.body, { lockDrag: this.props.lockDrag, unlockDrag: this.props.unlockDrag });
    if (this.lastData) {
      var parsed = this.lastData.reduce(function(culm, row){
        culm[row.key] = row.value;
        return culm;
      },{});
      this.bodyCard.loadState({ script: JSON.stringify(parsed, null, 4) });
      this.lastData = null;
    }
  }
}

Timeline.prototype.closeCard = function(card, force) {
  if (card) {
    abandon(card.view);
    var position = this.cards.indexOf(card);
    if (position !== -1) {
      this.cards.splice(position, 1);
    }
  }
  if (this.cards.length === 0 && !force) {
    this.addCard('CONFIG');
  }
}

Timeline.prototype.startingDrag = function(card, event) {
  this.dragging = card;
}

Timeline.prototype.beingDraggedOver = function(card, event) {
  this.cards.forEach(function(icard){
    icard.view.className = (icard === card && icard != this.dragging) ? 'dropcardview' : 'cardview';
  }, this);
}

Timeline.prototype.dropped = function(card, event) {
  if (this.dragging && this.dragging != card) {
    var cardPosition = this.cards.indexOf(this.dragging);
    var dropPosition = this.cards.indexOf(card);

    if (dropPosition > -1) {
      if (dropPosition > cardPosition) {
        this.dragging.view.parentElement.insertBefore(this.dragging.view, card.view.nextSibling);
      }
      else {
        this.dragging.view.parentElement.insertBefore(this.dragging.view, card.view);
      }
      arrayMove(this.cards, cardPosition, dropPosition);
    }
  }
}

Timeline.prototype.stoppedDrag = function(card, event) {
  this.cards.forEach(function(card){
    card.view.className = 'cardview';
  });
}

Timeline.prototype.addCard = function(initialCard) {
  var that = this;
  var nextCard = new Card(this.cardView, { id: `CARD_${this.cardCounter++}`, onClose: that.closeCard, initialCard, draggable: true, ondragstart: function(ev){
    that.startingDrag(nextCard, ev);
  }, ondrop: function(ev){
    that.dropped(nextCard, ev);
  }, ondragover: function(ev){
    ev.preventDefault();
    that.beingDraggedOver(nextCard, ev);
  }, ondragend: function(ev){
    that.stoppedDrag(nextCard, ev);
  } });
  this.cards.push(nextCard);
  return nextCard;
}

Timeline.prototype.clear = function() {
  for(var a = this.cards.length-1; a >= 0; a--) {
    this.closeCard(this.cards[a], true);
  }
}

Timeline.prototype.loadState = function(stateString) {
  this.clear();
  try {
    JSON.parse(stateString).forEach(function(cardstate){
      var buf = this.addCard();
      buf.loadState(cardstate);
    }, this);
  } catch (err) {
    err.desc = 'timeline state load json error';
    errorList.push(err);
    console.error(err);
  }
}

Timeline.prototype.setStateLink = function() {
  this.link.href = '#' + b64EncodeUnicode(this.saveState());
}

Timeline.prototype.saveState = function() {
  return JSON.stringify(this.cards.map(function(card){
    return card.saveState();
  }));
}

Timeline.prototype.act = function() {
  this.cards.reduce(function(accumulator, card) {
    return accumulator.then(card.act).catch(function(err){});
  }, Promise.resolve(true));
}

Card.prototype.lockDrag = function() {
  this.view.draggable = false;
}

Card.prototype.unlockDrag = function() {
  if (this.canDrag) {
    this.view.draggable = true;
  }
}

Card.prototype.showContent = function(contentType) {
  if (contentType === this.contentType) return
  this.contentType = contentType;

  if (this.innerView) {
    abandon(this.innerView.view);
  }
  this.innerView = null;

  var props={lockDrag: this.lockDrag, unlockDrag: this.unlockDrag};

  if (contentType === 'CONFIG') {
    this.innerView = new ConfigCard(this.content, props);
  } else if (contentType === 'REQUEST') {
    this.innerView = new RequestCard(this.content, props);
  } else if (contentType === 'ACT') {
    this.innerView = new ScriptCard(this.content, props);
  } else if (contentType === 'DISPLAY') {
    this.innerView = new DisplayCard(this.content, props);
  } else if (contentType === 'IF') {

  } else if (contentType === 'TEMPLATE') {

  } else if (contentType === 'REGEX') {

  }
}

Card.prototype.indicateActing = function() {
  this.view.className='activecardview';
  this.errorView.style.display = 'none';
}

Card.prototype.indicateFinishActing = function() {
  this.view.className='cardview';
}

Card.prototype.indicateError = function(error) {
  this.view.className='carderror';
  this.errorView.style.display = 'block';
  this.errorContent.innerHTML = makereadable(error.stack);
  errorList.push(error);
}

Card.prototype.act = function() {
  this.indicateActing();
  var that = this;
  ret = new Promise(function(resolve, reject) {
    var prom = that.toggle.getValue() && that.innerView && that.innerView.act();
    if (!prom) prom = Promise.resolve(true);
    prom.then(function(data){
      that.indicateFinishActing();
      resolve(data);
    }).catch(function(data){
      that.indicateError(data);
      reject(data);
    });
  });
  return ret;
}

Card.prototype.saveState = function() {
  return {contentType: this.contentType, content: this.innerView && this.innerView.saveState(), enabled: this.toggle.getValue()};
}

Card.prototype.loadState = function(state) {
  this.options.value=state.contentType;
  this.showContent(state.contentType);
  this.toggle.setToggleState(state.enabled);

  this.innerView && this.innerView.loadState(state.content);
}

var currentConfig = null;

var hashLocation = window.location.hash.split('#');

if (hashLocation.length > 1) {
  var result = b64DecodeUnicode(hashLocation[1]);
  currentConfig=result;
}

var timelineWrapper = spawn('div', document.getElementById('main'), { style: { display: 'flex' }});
var timeline = new Timeline(timelineWrapper);

if (currentConfig) timeline.loadState(currentConfig);

