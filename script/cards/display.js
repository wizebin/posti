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