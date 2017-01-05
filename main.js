
var test = function() {
  console.log('button clicked');
}

var RequestStepView = function(props) {
  var that = this;
  this.view = addQuickElement(null, 'div', null, {style: {height: '350px', display: 'flex', flexDirection: 'column'}});
  this.props = props;

  this.headerView = addQuickElement(this.view, 'div', null, {style: {display: 'flex', flexDirection: 'row', justifyContent: 'stretch'}});

  this.url = addQuickElement(this.headerView, 'input', null, {placeholder: 'url'});
  this.parameters = addQuickElement(this.headerView, 'input', null, {placeholder: 'parameters'});
  this.verb = addQuickElement(this.headerView, 'select', null, null, [
    addQuickElement(null, 'option', 'GET'),
    addQuickElement(null, 'option', 'POST'),
    addQuickElement(null, 'option', 'PATCH'),
    addQuickElement(null, 'option', 'PUT'),
    addQuickElement(null, 'option', 'DELETE'),
  ]);
  this.headers = addQuickElement(this.headerView, 'input', null, {placeholder: 'headers'});
  this.accept = addQuickElement(this.headerView, 'button', 'accept', { onclick: function() {
    that.props.act && that.props.act({action: 'accept', url: that.url.value, parameters: that.parameters.value, verb: that.verb.value, headers: that.headers.value});
  }});
  this.response = addQuickElement(this.view, 'div', null, {style: {backgroundColor: '#333', color: '#fff', padding: '10px', flex: '1', overflowY: 'auto'}});
}
var RequestStepModel = function() {
  this.url = 'http://api-dev.dispatch.me';
  this.verb = 'GET';
  this.headers = '';
  this.parameters = '';
}
var RequestStepController = function() {
  var that = this;
  this.model = new RequestStepModel();
  var boundFunction = (function(data) {
      this.onViewAction(data);
  }).bind(this);
  this.view = new RequestStepView({act: boundFunction});
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




RequestStepController.prototype.onViewChange = function(action, data) {

}
RequestStepController.prototype.onViewAction = function(action){
  console.log(this, action);
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



