// This is neat, no more worrying about what the this pointer of a component is, just put var that = thatWrapper(this); at the top of the constructor!
var thatWrapper = function(instance) {
  var that = this;
  if (this!=instance)
    this.that = instance;
  var prototype=Object.getPrototypeOf(instance);
  var keys = getObjectKeys(instance).concat(getObjectKeys(prototype));
  keys.forEach(function(key) {
    if (typeof(instance[key]) === "function") that[key] = instance[key].bind(instance);
  },this);
}

var me = function(instance) {
  if (!instance.transformedInstanceThis) {
    thatWrapper.call(instance, instance);
    instance.transformedInstanceThis=true;
  }
  return instance;
}


var Card = function(parent, props) {
  this.view = spawn('div', parent, objectAssign({}, props));
}


var ScriptStep = function(parent, props, children) {
  this.view = spawn('div', parent, props, children);
  this.view.style.position = this.view.style.position || 'relative';
  this.visible = true;

  var that = this;
  this.showButton = spawn('button', this.view, {onclick: function(){that.toggleShow();}, style: {zIndex: 10, position: 'relative'}}, 'show');

  spawn('textarea', this.view, {style: {position: 'absolute', left: '0px', top: '0px', right: '0px', bottom: '0px', width: '100%', zIndex: '0', boxSizing: 'border-box'}})

  this.setStyles();
}
ScriptStep.prototype.setStyles = function() {
  console.log('set styles');
  var that = this;
  if (!this.visible) {
    this.view.style.flex = 'none';
    this.showButton.innerHTML = 'show';
  } else {
    this.view.style.flex = '1';
    this.showButton.innerHTML = 'hide';
  }
}
ScriptStep.prototype.toggleShow = function() {
  this.visible = !this.visible;
  this.setStyles();
}

var RequestStepView = function(props) {
  var that = me(this);

  this.view = spawn('div', null, {style: {height: '350px', display: 'flex', flexDirection: 'column'}});
  this.props = props;

  this.headerView = spawn('div', this.view, {style: {display: 'flex', flexDirection: 'row', justifyContent: 'stretch'}});
  this.type = spawn('select', this.headerView, {onchange: function(){
    that.transform(that.type.value);
  }}, [
    spawn('option', null, null, 'RESOURCE'),
    spawn('option', null, null, 'SCRIPT'),
    spawn('option', null, null, 'MOD_RESOURCE'),
  ]);

  this.headerViewChange = spawn('div', this.headerView, {style: {display: 'flex', flexDirection: 'row', justifyContent: 'stretch'}});
  this.headerViewA = spawn('div', null, {style: {display: 'flex', flexDirection: 'row', justifyContent: 'stretch'}});
  this.headerViewB = spawn('div', null, {style: {display: 'flex', flexDirection: 'row', justifyContent: 'stretch'}});

  this.transform('RESOURCE');

  this.url = spawn('input', this.headerViewA, {placeholder: 'url'});
  this.parameters = spawn('input', this.headerViewA, {placeholder: 'parameters'});

  this.verb = spawn('select', this.headerViewA, null, [
    spawn('option', null, null, 'GET'),
    spawn('option', null, null, 'POST'),
    spawn('option', null, null, 'PATCH'),
    spawn('option', null, null, 'PUT'),
    spawn('option', null, null, 'DELETE'),
  ]);

  this.headers = spawn('input', this.headerViewA, {placeholder: 'headers'});

  this.accept = spawn('button', this.headerViewA, { onclick: function() {
    that.props.act && that.props.act({action: 'accept', url: that.url.value, parameters: that.parameters.value, verb: that.verb.value, headers: that.headers.value});
  }}, 'accept');

  this.response = spawn('div', this.view, {style: {backgroundColor: '#333', color: '#fff', padding: '10px', flex: '1', overflowY: 'auto'}});
  this.sstep = new ScriptStep(this.view, {style: {backgroundColor: '#00a8ff', color: '#fff', padding: '10px', flex: '1', overflowY: 'auto'}});
}
var RequestStepModel = function() {
  this.url = 'http://api-dev.dispatch.me';
  this.verb = 'GET';
  this.headers = '';
  this.parameters = '';
}
var RequestStepController = function() {
  var that = me(this);
  this.model = new RequestStepModel();
  this.view = new RequestStepView({act: that.onViewAction});
}

RequestStepModel.prototype.getParameters = function() {
  return {
    'url': this.url,
    'verb': this.verb || 'GET',
    'headers': this.headers,
    'parameters': this.parameters,
    'username': this.username,
    'password': this.password,
  };
}
RequestStepModel.prototype.request = function(callback) {
  console.log('requesting', this.getParameters());
  httpVERB('request/', 'POST', JSON.stringify(this.getParameters()), null).then((results) => {
    try{
      var parsed = JSON.parse(results);
      callback && callback(parsed);
    } catch(err) {
      console.log('json err', err, results);
    }
  });
}

RequestStepView.prototype.displayIn = function(parent) {
  parent.appendChild(this.view);
}
RequestStepView.prototype.show = function(data) {
  this.response.innerHTML = data;
}
RequestStepView.prototype.transform = function(data) {
  this.headerViewChange.innerHTML = '';
  if (data === 'RESOURCE')
    adopt(this.headerViewA, this.headerViewChange);
  else if (data === 'SCRIPT')
    adopt(this.headerViewB, this.headerViewChange);

}

RequestStepController.prototype.onViewChange = function(action, data) {

}
RequestStepController.prototype.onViewAction = function(action){
  this.model.url = action.url;
  this.model.verb = action.verb;
  this.model.parameters = action.parameters;
  this.model.headers = action.headers;
  var that = this;
  this.model.request(function(data){
    that.view.show(makereadable(JSON.stringify(data, null, '\t')));
  });
}
RequestStepController.prototype.onModelChange = function(action, data) {

}




var tmp = new RequestStepController();
tmp.view.displayIn(document.getElementById('main'));



