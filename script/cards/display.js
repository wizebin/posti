DisplayCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'displayview' });
  this.subject = spawn('input', this.view, { className: 'displayinput', placeholder: 'To Display (defaults to lastResult)', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()}});
  this.display = spawn('textarea', this.view, { className: 'displayoutput', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} });

  this.editor = ace.edit();
  this.editor.setTheme("ace/theme/chrome");
  this.editor.getSession().setMode(this.editorMode || "ace/mode/json");
  this.editor.getSession().setTabSize(2);
  this.editor.getSession().setUseWrapMode(true);
  this.editor.getSession().setUseWrapMode(true);
  this.editor.container.style.height = '100%';
  this.editor.container.style.width = '100%';
  this.editor.container.style.minHeight = '100px';

  adopt(this.view, this.editor.container);
  this.editor.resize();
  this.editor.container.style.display = 'none';
}

DisplayCard.prototype.act = function() {
  try {
    var result = this.subject.value ? eval(this.subject.value) : window.lastResult;
    if (!isString(result)) {
      this.showAsJson(JSON.stringify(result, null, 4));
    } else {
      try {
        var val = JSON.stringify(JSON.parse(result), null, 4);
        this.showAsJson(val);
      } catch (err) {
        this.showAsPlain(result);
      }
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
}

DisplayCard.prototype.showAsJson = function(value) {
  this.display.style.display = 'none';
  this.editor.container.style.display = 'block';
  this.editor.setValue(value || '');
}

DisplayCard.prototype.showAsPlain = function(value) {
  this.display.style.display = 'block';
  this.editor.container.style.display = 'none';
  this.display.value=value;
}

DisplayCard.prototype.onMouseUp = function() {
  if (!this.previousSize || this.previousSize != getElementSize(this.view)) {
    this.editor.resize();
    this.previousSize = getElementSize(this.view);
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