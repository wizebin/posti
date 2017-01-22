DisplayCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'displayview' });
  this.subject = spawn('input', this.view, { className: 'displayinput', placeholder: 'To Display (defaults to lastResult)', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()}});
  this.display = spawn('textarea', this.view, { className: 'displayoutput', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} });
}

DisplayCard.prototype.act = function() {
  try {
    var result = this.subject.value ? eval(this.subject.value) : window.lastResult;
    if (!isString(result)) {
      this.display.value = JSON.stringify(result, null, 4);
    } else {
      try {
        this.display.value = JSON.stringify(JSON.parse(result), null, 4);
      } catch (err) {
        this.display.value = result;
      }
    }
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