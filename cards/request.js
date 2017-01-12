RequestCard = function(parent, props) {
  var that = me(this);
  this.props=props;
  this.view = spawn('div', parent, { className: 'requestview' });
  this.header = spawn('div', this.view, { className: 'requestheader' }, [
    this.verb = spawn('select', null, { className: 'requestverb', onchange: function() {
      // that.showContent(this.value);
    }}, [
      spawn('option', null, null, 'GET'),
      spawn('option', null, null, 'POST'),
      spawn('option', null, null, 'PATCH'),
      spawn('option', null, null, 'PUT'),
      spawn('option', null, null, 'DELETE'),
    ]),
    this.url = spawn('input', null, { className: 'requesturl', placeholder: 'url', onmousedown: function(){that.props.lockDrag&&that.props.lockDrag()}, onmouseup: function(){that.props.unlockDrag&&that.props.unlockDrag()} }),
    this.mime = spawn('select', null, { className: 'requestmime', onchange: function() {
      that.setBodyType(this.value);
    }}, [
      spawn('option', null, null, 'Form'),
      spawn('option', null, null, 'Raw'),
      spawn('option', null, null, 'Json'),
      // spawn('option', null, null, 'Xml'),
    ]),
  ]);
  this.headerWrap = spawn('div', this.view, { className: 'headerbody' });
  this.headers = new ConfigCard(this.headerWrap, {addText: 'Add Header', keyText: 'Header', lockDrag: this.props.lockDrag, unlockDrag: this.props.unlockDrag});
  this.body = spawn('div', this.view, { className: 'requestbody' });
  this.footer = spawn('div', this.view, { className: 'requestfooter', });

  this.verb.onchange();
  this.mime.onchange();
}

function getObjectAsHeaderArray(obj) {
  var keys = getObjectKeys(obj);
  return keys.reduce(function(culm, key) {
    culm.push(`${key}: ${obj[key]}`);
    return culm;
  },[]);
}


RequestCard.prototype.getParameters = function() {

  var headers = this.headers.getValue(true);
  if (!headers['Content-Type']) {
    if (this.mime.value === 'Form') headers['Content-Type'] = 'application/x-www-form-urlencoded';
    else if (this.mime.value === 'Json') headers['Content-Type'] = 'application/json';
    else if (this.mime.value === 'Xml') headers['Content-Type'] = 'application/xml';
  }

  return {
    'url': getEvaluatedString(this.url.value),
    'verb': this.verb.value || 'GET',
    'headers': getObjectAsHeaderArray(headers),
    'parameters': this.bodyType === 'Form' ? encodeURIObject(this.bodyCard.getValue(true)) : getEvaluatedString(this.bodyCard.getValue()),
    'mime': this.mime.value,
    // 'username': this.username,
    // 'password': this.password,
  };
}

RequestCard.prototype.request = function() {
  return httpVERB('request/', 'POST', JSON.stringify(this.getParameters()), null);
}

RequestCard.prototype.act = function() {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.request().then(function(data) {
      if (that.mime.value==='Json') {
        try{
          var parsed = JSON.parse(data);
          window.lastResult = parsed;
          resolve(parsed);
          return;
        } catch (err) {
          reject(err);
        }
      }
      window.lastResult = data;
      resolve(parsed);
    });
  });
}

RequestCard.prototype.saveState = function() {
  return {verb: this.verb.value, url: this.url.value, mime: this.mime.value, headers: this.headers.saveState(), bodyType: this.bodyType, body: this.bodyCard && this.bodyCard.saveState()};
}

RequestCard.prototype.loadState = function(state) {
  if (!state) state = {};
  this.verb.value = state.verb || '';
  this.url.value = state.url || '';
  this.mime.value = state.mime || 'Form';
  this.headers.loadState(state.headers);
  this.setBodyType(state.bodyType || this.mime.value);
  this.bodyCard.loadState(state.body || {});
}

RequestCard.prototype.setBodyType = function(type) {
  if (this.bodyCard) {
    if (this.bodyType == type) return;
    if (this.bodyType == 'Form') {
      this.lastData = this.bodyCard.getOrderedValue(false);
    } else {
      var parsed = JSON.parse(this.bodyCard.getValue(false));
      var keys = getObjectKeys(parsed);
      this.lastData = keys.map(function(key){
        return { key, value: parsed[key] };
      }, this);
    }
    abandon(this.bodyCard.view);
    this.bodyCard = null;
  }
  this.bodyType = type;
  if (type === 'Form') {
    this.bodyCard = new ConfigCard(this.body, { addText: 'Add Body Parameter', keyText: 'Body Parameter', lockDrag: this.props.lockDrag, unlockDrag: this.props.unlockDrag});
    if (this.lastData) {
      this.bodyCard.loadState(this.lastData);
      this.lastData = null;
    }
  } else {
    this.bodyCard = new ScriptCard(this.body, { lockDrag: this.props.lockDrag, unlockDrag: this.props.unlockDrag });
    if (this.lastData) {
      var parsed = this.lastData.reduce(function(culm, row){
        culm[row.key] = row.value;
        return culm;
      },{});
      this.bodyCard.loadState({ script: JSON.stringify(parsed, null, 4) });
      this.lastData = null;
    }
  }
}