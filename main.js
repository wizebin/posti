function getEvaluatedString(str) {
  var escaped = `\`${str.replace('`','\\`')}\``;
  try {
    var ret = eval(escaped);
    return ret;
  } catch (err) {
    return str;
  }
}

function getObjectAsHeaderArray(obj) {
  var keys = getObjectKeys(obj);
  return keys.reduce(function(culm, key) {
    culm.push(`${key}: ${obj[key]}`);
    return culm;
  },[]);
}

var Timeline = function(parent, props) {
  var that = me(this);
  this.view = spawn('div', parent, objectAssign({ className: 'timelineview' }, props));

  this.cards = [];

  this.cardView = spawn('div', this.view, { className: 'cardwrapper' });

  this.addButton = spawn('button', this.view, { className: 'timelineadd', onclick: function() {
    that.addCard();
  } }, 'Add Step');

  this.actButton = spawn('button', this.view, { className: 'timelineact', onclick: function() {
    that.cards.reduce(function(accumulator, card) {
      return accumulator.then(card.act);
    }, Promise.resolve(true));
  } }, 'Perform');

  this.stateText = spawn('input', this.view, { placeholder: 'state text' });

  this.saveButton = spawn('button', this.view, { className: 'timelinesave', onclick: function() {
    that.stateText.value = JSON.stringify(that.cards.map(function(card){
      return card.saveState();
    }));
  } }, 'Save Configuration');

  this.loadButton = spawn('button', this.view, { className: 'timelinesave', onclick: function() {
    that.clear();
    try {
      JSON.parse(that.stateText.value).forEach(function(cardstate){
        var buf = that.addCard();
        buf.loadState(cardstate);
      }, this);
    } catch (err) {
      console.log('state load error', err);
    }
  } }, 'Load Configuration');

  this.addCard('CONFIG');
}


var Card = function(parent, props) {
  var that = me(this);
  this.props = props;
  this.view = spawn('div', parent, objectAssign({ className: 'cardview' }, props));

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
  ]);
  this.content = spawn('div', this.view, { className: 'cardcontent', style: { padding: '10px' } });
  if (this.props.initialCard) this.options.value = this.props.initialCard;
  this.options.onchange();
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
    key: spawn('input', null, { className: 'configkey', style: { flex: '1' }, value:defaultKey || '', placeholder: this.props.keyText || 'key' }),
    val: spawn('input', null, { className: 'configval', style: { flex: '1' }, value:defaultVal || '', placeholder: 'value' }),
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
  var result = this.evaluateAndSetConfig();
  Promise.resolve(result);
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
  console.log('loading state', state);
  this.clear(state.length > 0);
  state.forEach(function(line){
    this.addConfigLine(line.key, line.value);
  }, this);
}

DisplayCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'displayview' });
  this.subject = spawn('input', this.view, { className: 'displayinput', placeholder: 'toDisplay (defaults to last results)' });
  this.display = spawn('textarea', this.view, { className: 'displayoutput' });
}

DisplayCard.prototype.act = function() {
  this.display.value = this.subject.value ? eval(this.subject.value) : window.lastResult;
  return Promise.resolve();
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


ScriptCard = function(parent) {
  var that = me(this);
  this.view = spawn('div', parent, { className: 'scriptview', style: { backgroundColor: '#eee', color: '#fff' } });
  this.text = spawn('textarea', this.view, { className: 'scripttext' });
}

ScriptCard.prototype.act = function() {
  var result = eval(this.getValue());
  window.lastResult = result;
  Promise.resolve(result);
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


RequestCard = function(parent) {
  var that = me(this);
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
    this.url = spawn('input', null, { className: 'requesturl', placeholder: 'url' }),
    this.mime = spawn('select', null, { className: 'requestmime', onchange: function() {
      that.setBodyType(this.value);
    }}, [
      spawn('option', null, null, 'Form'),
      spawn('option', null, null, 'Raw'),
      spawn('option', null, null, 'Json'),
      spawn('option', null, null, 'Xml'),
    ]),
  ]);
  this.headers = new ConfigCard(this.view, {addText: 'Add Header', keyText: 'Header'});
  this.body = spawn('div', this.view, { className: 'requestbody' });
  this.footer = spawn('div', this.view, { className: 'requestfooter', });
  this.results = new ScriptCard(this.view);
  this.results.view.style.display = 'none';

  this.verb.onchange();
  this.mime.onchange();
}

RequestCard.prototype.getParameters = function() {
  return {
    'url': getEvaluatedString(this.url.value),
    'verb': this.verb.value || 'GET',
    'headers': getObjectAsHeaderArray(this.headers.getValue(true)),
    'parameters': this.bodyType === 'Form' ? encodeURIObject(this.bodyCard.getValue(true)) : getEvaluatedString(this.bodyCard.getValue()),
    'mime': this.mime.value,
    // 'username': this.username,
    // 'password': this.password,
  };
}
RequestCard.prototype.request = function() {
  console.log('requesting', this.getParameters());
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
  console.log()
  if (this.bodyCard) {
    if (this.bodyType == type) return;
    if (this.bodyType == 'Form') {

    }
    abandon(this.bodyCard.view);
    this.bodyCard = null;
  }
  this.bodyType = type;
  if (type === 'Form') {
    this.bodyCard = new ConfigCard(this.body, { addText: 'Add Body Parameter', keyText: 'Body Parameter' });
  } else {
    this.bodyCard = new ScriptCard(this.body);
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

Timeline.prototype.addCard = function(initialCard) {
  var that = this;
  var nextCard = new Card(this.cardView, { onClose: that.closeCard, initialCard });
  this.cards.push(nextCard);
  return nextCard;
}

Timeline.prototype.clear = function() {
  for(var a = this.cards.length-1; a >= 0; a--) {
    this.closeCard(this.cards[a], true);
  }
}

Card.prototype.showContent = function(contentType) {
  if (contentType === this.contentType) return
  this.contentType = contentType;

  if (this.innerView) {
    abandon(this.innerView.view);
  }
  this.innerView = null;

  if (contentType === 'CONFIG') {
    this.innerView = new ConfigCard(this.content);
  } else if (contentType === 'REQUEST') {
    this.innerView = new RequestCard(this.content, contentType);
  } else if (contentType === 'ACT') {
    this.innerView = new ScriptCard(this.content);
  } else if (contentType === 'DISPLAY') {
    this.innerView = new DisplayCard(this.content);
  } else if (contentType === 'IF') {

  } else if (contentType === 'TEMPLATE') {

  } else if (contentType === 'REGEX') {

  }
}
Card.prototype.act = function() {
  console.log('card action');
  return this.innerView ? this.innerView.act() : Promise.resolve(true);
}

Card.prototype.saveState = function() {
  return {contentType: this.contentType, content: this.innerView && this.innerView.saveState()};
}
Card.prototype.loadState = function(state) {
  this.options.value=state.contentType;
  this.showContent(state.contentType);
  this.innerView && this.innerView.loadState(state.content);
}



var timeline = new Timeline(document.getElementById('main'));

