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