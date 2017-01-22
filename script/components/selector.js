var selector = function(parent, props) {
  var that = me(this);
  this.props = objectAssign({ className: 'selector' }, props);
  this.view = spawn('div', parent, this.props);
}

selector.prototype.onMouseDown = function() {
  this.startMouse = getMousePos();
  this.startPosition = getOffsetRect(this.view);
}

selector.prototype.onMouseMove = function() {
  this.curMouse = getMousePos();

  var position = { top: 0, left: 0, width: 0, height: 0};

  if (curMouse.x < startMouse.x) {
    position.width = startMouse.x - curMouse.x
    position.left = startPosition.left - position.width;
  } else {
    position.width = curMouse.x - startMouse.x;
    position.left = startPosition.left - position.width;
  }

  if (curMouse.y < startMouse.y) {
    position.height = startMouse.y - curMouse.y;
    position.top = startPosition.top - position.height;
  } else {
    position.height = curMouse.y - startMouse.y;
    position.top = startPosition.top - position.height;
  }

  this.view.style.top = `${top}px`;
  this.view.style.left = `${left}px`;
  this.view.style.width = `${width}px`;
  this.view.style.height = `${height}px`;
}