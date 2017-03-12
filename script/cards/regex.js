RegexCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'displayview' });
  this.find = spawn('input', this.view, { className: 'displayinput', placeholder: 'Regex to find', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()}});
  this.replace = spawn('input', this.view, { className: 'displayinput', placeholder: 'Replacement', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()}});
  this.display = spawn('textarea', this.view, { className: 'displayoutput', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} });
}

RegexCard.prototype.act = function() {
  try {
    window.lastResult = replacex(window.lastResult, this.find.value, getEvaluatedString(this.replace.value), 'gm');

    var result = window.lastResult;
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

RegexCard.prototype.clear = function() {
  this.find.value = '';
  this.replace.value = '';
}

RegexCard.prototype.saveState = function() {
  return {
    find: this.find.value,
    replace: this.replace.value,
  };
}

RegexCard.prototype.loadState = function(state) {
  this.clear();
  this.find.value = state.find;
  this.replace.value = state.replace;
}