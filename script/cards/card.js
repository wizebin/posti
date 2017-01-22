function findPositionRelative(descendant, ancestor) {
  var offsetDesc = getOffsetRect(descendant);
  var offsetPar = getOffsetRect(ancestor);
  return {
    x: offsetDesc.x - offsetPar.x,
    y: offsetDesc.y - offsetPar.y
  };
}

var Card = function(parent, props) {
  var that = me(this);
  this.props = objectAssign({ className: 'cardview', onmousedown: function(ev){
    var targetOffset = getOffsetRect(ev.target);
    that.clickPos = { x: targetOffset.x + ev.layerX, y: targetOffset.y + ev.layerY};
    var viewOffset = getOffsetRect(that.view);
    that.clickOff = { x: that.clickPos.x - viewOffset.x, y: that.clickPos.y - viewOffset.y };
  } }, props);
  if (this.props.draggable) {
    this.canDrag = true;
  }
  this.view = spawn('div', parent, this.props);

  this.header = spawn('div', this.view, { className: 'cardheader' }, [
    spawn('div', null, { className: 'cardconfigdiv' }, [
      this.options = spawn('select', null, { className: 'cardselect', onchange: function() {
        that.showContent(this.value);
      }}, [
        spawn('option', null, null, 'REQUEST'),
        spawn('option', null, null, 'ACT'),
        spawn('option', null, null, 'CONFIG'),
        spawn('option', null, null, 'DISPLAY'),
      ]),
      this.title = spawn('input', null, { className: 'cardtitle', placeholder: 'title', onmousedown: function(){that.lockDrag()}, onmouseup: function(){that.unlockDrag()} }),
      this.toggle = new ToggleButton(null, { toggled: true, onClass: 'toggleon', offClass: 'toggleoff' }),
    ]),
    spawn('div', null, { className: 'carddisplaydiv' }, [
      this.minimize = spawn('button', null, { className: 'cardminimize', onclick: function() {
        that.minimize();
      } }, '-'),
      this.closer = spawn('button', null, { className: 'cardclose', onclick: function() {
        that.props.onClose && that.props.onClose(that);
      } }, 'X'),
    ]),
  ]);

  this.errorView = spawn('div', this.view, { className: 'errorview', style: { display: 'none'}}, [
    this.errorContent = spawn('div', null, { className: 'errorcontent' }),
  ]);

  this.content = spawn('div', this.view, { className: 'cardcontent', style: { padding: '10px' } });
  if (this.props.initialCard) this.options.value = this.props.initialCard;
  this.options.onchange();
  window.addEventListener ("mouseup", function () {that.unlockDrag()}, false);
}
Card.prototype.minimize = function() {

}
Card.prototype.lockDrag = function() {
  this.view.draggable = false;
}

Card.prototype.unlockDrag = function() {
  if (this.canDrag) {
    this.view.draggable = true;
  }
}

var headerColors = {
  CONFIG: '#ffcc96',
  REQUEST: '#97ff96',
  ACT: '#383838',
  DISPLAY: '#bad5ff',
};

Card.prototype.showContent = function(contentType) {
  if (contentType === this.contentType) return
  this.contentType = contentType;

  if (this.innerView) {
    abandon(this.innerView.view);
  }
  this.innerView = null;

  var props={lockDrag: this.lockDrag, unlockDrag: this.unlockDrag};

  if (contentType === 'CONFIG') {
    this.innerView = new ConfigCard(this.content, props);
  } else if (contentType === 'REQUEST') {
    this.innerView = new RequestCard(this.content, props);
  } else if (contentType === 'ACT') {
    this.innerView = new ScriptCard(this.content, props);
  } else if (contentType === 'DISPLAY') {
    this.innerView = new DisplayCard(this.content, props);
  } else if (contentType === 'IF') {

  } else if (contentType === 'TEMPLATE') {

  } else if (contentType === 'REGEX') {

  }

  this.header.style.backgroundColor = headerColors[contentType] || '#eee';
  this.header.style.color = '#757575';
}

Card.prototype.indicateActing = function() {
  this.view.className='activecardview';
  this.errorView.style.display = 'none';
}

Card.prototype.indicateFinishActing = function() {
  this.view.className='cardview';
}

Card.prototype.indicateError = function(error) {
  this.view.className='carderror';
  this.errorView.style.display = 'block';
  this.errorContent.innerHTML = makereadable(error.stack);
}

Card.prototype.act = function() {
  this.indicateActing();
  var that = this;
  ret = new Promise(function(resolve, reject) {
    var prom = that.toggle.getValue() && that.innerView && that.innerView.act();
    if (!prom) prom = Promise.resolve(true);
    prom.then(function(data){
      that.indicateFinishActing();
      resolve(data);
    }).catch(function(data){
      that.indicateError(data);
      reject(data);
    });
  });
  return ret;
}

Card.prototype.saveState = function() {
  return {contentType: this.contentType, content: this.innerView && this.innerView.saveState(), enabled: this.toggle.getValue()};
}

Card.prototype.loadState = function(state) {
  this.options.value=state.contentType;
  this.showContent(state.contentType);
  this.toggle.setToggleState(state.enabled);

  this.innerView && this.innerView.loadState(state.content);
}