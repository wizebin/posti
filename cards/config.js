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