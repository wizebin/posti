SetCard = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'displayview' });

  spawn('div', this.view, { style: { display: 'flex', marginBottom: '10px' } }, [
    this.subject = spawn('input', null, { style: { flex: '1', marginBottom: '0px' }, className: 'displayinput', placeholder: 'Variable to set (default lastResult)', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()}}),
    spawn('span', null, { style: { alignSelf: 'center', fontSize: '12px', marginLeft: '5px' } }, 'Evaluated'),
    this.evaluateToggle = new ToggleButton(null, { style: { marginLeft: '5px', marginRight: '5px' }, toggled: true, onClass: 'toggleon', offClass: 'toggleoff' }),
  ]);

  this.object = spawn('textarea', this.view, { className: 'displayoutput', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} });
}

SetCard.prototype.act = function() {
  try {
    window[this.subject.value || 'lastResult'] = this.evaluateToggle.value ? getEvaluatedString(this.object.value) : this.object.value;
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
    eval: this.evaluateToggle.value,
  };
}

SetCard.prototype.loadState = function(state) {
  this.clear();
  this.subject.value = state.subject;
  this.object.value = state.object;
  this.evaluateToggle.setToggleState(state.eval);
}