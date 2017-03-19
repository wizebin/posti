ScriptCard = function(parent, props) {
  var that = me(this, props);
  this.props = props || {};

  this.editor = ace.edit();
  this.editor.setTheme("ace/theme/chrome");
  this.editor.getSession().setMode(this.editorMode || "ace/mode/javascript");
  this.editor.getSession().setTabSize(2);
  this.editor.getSession().setUseWrapMode(true);
  this.editor.getSession().setUseWrapMode(true);
  this.editor.container.style.height= '100%';
  this.editor.container.style.width= '100%';
  this.editor.container.style.minHeight= '100px';

  this.view = spawn('div', parent, { className: 'scriptview', style: { backgroundColor: '#eee', color: '#fff' } }, [
    this.editor.container,
  ]);

  this.editor.resize();
}

ScriptCard.prototype.onMouseUp = function() {
  if (!this.previousSize || this.previousSize != getElementSize(this.view)) {
    this.editor.resize();
    this.previousSize = getElementSize(this.view);
  }
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
  return this.editor.getValue();
}

ScriptCard.prototype.setValue = function(val) {
  this.editor.setValue(val);
  this.editor.clearSelection();
}

ScriptCard.prototype.saveState = function() {
  return {script: this.getValue()};
}

ScriptCard.prototype.loadState = function(state) {
  this.setValue((state && state.script) || '');
}