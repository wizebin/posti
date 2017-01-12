var ToggleButton = function(parent, props) {
  var that = me(this);
  this.props = props || {};
  this.view = spawn('div', parent, { className: 'toggleView', onclick: that.onClick });
  this.toggled = this.props.toggled || true;
  this.showToggledState();
}

ToggleButton.prototype.setToggleState = function(toggled) {
  this.toggled = toggled;
  this.showToggledState();
}

ToggleButton.prototype.getValue = function() {
  return this.toggled;
}

ToggleButton.prototype.showToggledState = function() {
  if (this.toggled) {
    if (this.props.onClass) {
      this.view.className = this.props.onClass;
      this.view.innerHTML = '&#10003;';
    }
  } else {
    if (this.props.offClass) {
      this.view.className = this.props.offClass;
      this.view.innerHTML = '';
    }
  }
}

ToggleButton.prototype.onClick = function() {
  this.setToggleState(!this.getValue());
  this.props.onclick && this.props.onclick(this.toggled);
}