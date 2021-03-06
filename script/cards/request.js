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
    this.authtype = spawn('select', null, { style: { marginLeft: '5px', marginRight: '5px' }, className: 'requestverb', onchange: function() {
      if (that.authtype.value === 'No Auth') {
        that.credentialWrap.style.display = 'none';
      } else {
        that.credentialWrap.style.display = 'block';
      }
    }}, [
      spawn('option', null, null, 'No Auth'),
      spawn('option', null, null, 'Basic'),
      spawn('option', null, null, 'Digest'),
    ]),
    spawn('span', null, { style: { alignSelf: 'center', fontSize: '12px' } }, 'Local'),
    this.localToggle = new ToggleButton(null, { style: { marginLeft: '5px', marginRight: '5px' }, toggled: true, onClass: 'toggleon', offClass: 'toggleoff' }),
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
  this.credentialWrap = spawn('div', this.view, { className: 'headerpassbody', style: { display: 'none' }}, [
    this.username = spawn('input', null, { className: 'configkey', placeholder: 'username', style: { flex: '1' } }),
    this.password = spawn('input', null, { className: 'configval', placeholder: 'password', style: { flex: '1' } }),
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

RequestCard.prototype.onMouseUp = function() {
  this.bodyCard.onMouseUp && this.bodyCard.onMouseUp();
}

RequestCard.prototype.onToggleSecure = function() {

}

RequestCard.prototype.getParameters = function() {

  var headers = this.getEvaluatedHeaders();

  var ret = {
    'url': this.getEvaluatedUrl(),
    'verb': this.getEvaluatedVerb(),
    'headers': getObjectAsHeaderArray(headers),
    'parameters': this.getEvaluatedParams(),
    'mime': this.mime.value
  };

  if (this.authtype.value !== 'No Auth') {
    ret['auth'] = this.authtype.value.toLowerCase();
    ret['username'] = this.getEvaluatedUsername();
    ret['password'] = this.getEvaluatedPassword();
  }

  return ret;
}

RequestCard.prototype.getEvaluatedUrl = function() {
  return getEvaluatedString(this.url.value);
}

RequestCard.prototype.getEvaluatedVerb = function() {
  return getEvaluatedString(this.verb.value) || 'GET';
}
RequestCard.prototype.getEvaluatedUsername = function() {
  return getEvaluatedString(this.username.value);
}

RequestCard.prototype.getEvaluatedPassword = function() {
  return getEvaluatedString(this.password.value);
}

RequestCard.prototype.getEvaluatedHeaders = function() {
  var headers = this.headers.getValue(true);
  if (!headers['Content-Type']) {
    if (this.mime.value === 'Form') headers['Content-Type'] = 'application/x-www-form-urlencoded';
    else if (this.mime.value === 'Json') headers['Content-Type'] = 'application/json';
    else if (this.mime.value === 'Xml') headers['Content-Type'] = 'application/xml';
  }
  if (!headers["Authorization"]){
    if (this.authtype.value === "Basic") {
      headers["Authorization"] = "Basic " + btoa(getEvaluatedUsername + ":" + getEvaluatedPassword);
    } else if (this.authtype === "Digest") {
      console.error('Digest authentication not supported in front end request yet');
      headers["Authorization"] = "Basic " + btoa(getEvaluatedUsername + ":" + getEvaluatedPassword);
    }
  }
  return headers;
}

RequestCard.prototype.getEvaluatedParams = function() {
  if (this.bodyType === 'Form')
    return encodeURIObject(this.bodyCard.getValue(true))
  else if (this.bodyType === 'Raw')
    return getEvaluatedString(this.bodyCard.getValue(true))
  else if (this.bodyType === 'Json')
    return getEvaluatedString(this.bodyCard.getValue());
}

RequestCard.prototype.request = function() {
  if (this.localToggle.value) {
    return httpVERB(this.getEvaluatedUrl(), this.getEvaluatedVerb(), this.getEvaluatedParams(), this.getEvaluatedHeaders());
  } else {
    return httpVERB('request/', 'POST', JSON.stringify(this.getParameters()), null);
  }
}

RequestCard.prototype.act = function() {
  var that = this;
  return new Promise(function(resolve, reject) {
    that.request().then(function(data) {
      try{
        var parsed = JSON.parse(data);
        window.lastResult = parsed;
        resolve(parsed);
        return;
      } catch (err) {
        if (that.mime.value==='Json') {
          reject(err);
        } else {
          window.lastResult = data;
          resolve(parsed);
        }
      }
    }).catch(function(data) {
      if (data && 'status' in data)
        reject(new Error(`(HTTP: ${data.status}): ${data.responseText}`));
      else
        reject(data);
    });
  });
}

RequestCard.prototype.saveState = function() {
  return {
    verb: this.verb.value,
    url: this.url.value,
    local: this.localToggle.value,
    authtype: this.authtype.value,
    username: this.username.value,
    password: this.password.value,
    mime: this.mime.value,
    headers: this.headers.saveState(),
    bodyType: this.bodyType,
    body: this.bodyCard && this.bodyCard.saveState()
  };
}

RequestCard.prototype.loadState = function(state) {
  if (!state) state = {};
  this.verb.value = state.verb || '';
  this.url.value = state.url || '';
  this.localToggle.setToggleState(state.local || false);
  this.authtype.value = state.authtype || 'No Auth';
  this.username.value = state.username || '';
  this.password.value = state.password || '';
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
    } else if (this.bodyType == 'Raw') {
      var bodyValue = this.bodyCard.getValue(false)
      this.lastData = bodyValue.split("&").map(function(stringPair) {
          var pair = stringPair.split("=");
          return { key: decodeURIComponent(pair[0]), value: decodeURIComponent(pair[1]) };
      }, this);
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
  } else if (type === 'Raw') {
    this.bodyCard = new ScriptCard(this.body, { editorMode: "ace/mode/text", lockDrag: this.props.lockDrag, unlockDrag: this.props.unlockDrag });
    if (this.lastData) {
      var parsed = this.lastData.reduce(function(culm, row){
        culm[row.key] = row.value;
        return culm;
      },{});
      this.bodyCard.loadState({ script: encodeURIObject(parsed) });
      this.lastData = null;
    }
  } else {
    this.bodyCard = new ScriptCard(this.body, { editorMode: "ace/mode/json", lockDrag: this.props.lockDrag, unlockDrag: this.props.unlockDrag });
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