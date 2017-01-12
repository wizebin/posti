var Card = function(parent, props) {
  var that = me(this);
  this.props = objectAssign({ className: 'cardview' }, props);
  if (this.props.draggable) {
    this.canDrag = true;
  }
  this.view = spawn('div', parent, this.props);
  this.errorView = spawn('div', this.view, { className: 'errorview', style: { display: 'none'}}, [
    this.errorContent = spawn('div', null, { className: 'errorcontent' }),
  ]);

  this.header = spawn('div', this.view, { className: 'cardheader' }, [
    this.options = spawn('select', null, { className: 'cardselect', onchange: function() {
      that.showContent(this.value);
    }}, [
      spawn('option', null, null, 'REQUEST'),
      spawn('option', null, null, 'ACT'),
      spawn('option', null, null, 'CONFIG'),
      spawn('option', null, null, 'DISPLAY'),
    ]),
    this.closer = spawn('button', null, { className: 'cardclose', onclick: function() {
      that.props.onClose && that.props.onClose(that);
    } }, 'Delete Step'),
    this.toggle = new ToggleButton(null, { toggled: true, onClass: 'toggleon', offClass: 'toggleoff' }),
  ]);
  this.content = spawn('div', this.view, { className: 'cardcontent', style: { padding: '10px' } });
  if (this.props.initialCard) this.options.value = this.props.initialCard;
  this.options.onchange();
  window.addEventListener ("mouseup", function () {that.unlockDrag()}, false);
}

Card.prototype.lockDrag = function() {
  this.view.draggable = false;
}

Card.prototype.unlockDrag = function() {
  if (this.canDrag) {
    this.view.draggable = true;
  }
}

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