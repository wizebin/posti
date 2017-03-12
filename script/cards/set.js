SetCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'displayview' });
  this.subject = spawn('input', this.view, { className: 'displayinput', placeholder: 'Variable to set (default lastResult)', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()}});
  this.object = spawn('textarea', this.view, { className: 'displayoutput', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} });
}

SetCard.prototype.act = function() {
  try {
    window[this.subject.value || 'lastResult'] = getEvaluatedString(this.object.value);
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

SetCard.prototype.clear = function() {
  this.subject.value = '';
  this.object.value = '';
}

SetCard.prototype.saveState = function() {
  return {
    subject: this.subject.value,
    object: this.object.value,
  };
}

SetCard.prototype.loadState = function(state) {
  this.clear();
  this.subject.value = state.subject;
  this.object.value = state.object;
}