var currentConfig = null;

var hashLocation = window.location.hash.split('#');

if (hashLocation.length > 1) {
  var result = b64DecodeUnicode(hashLocation[1]);
  currentConfig=result;
}

var timelineWrapper = spawn('div', document.getElementById('main'), { style: { display: 'flex' }});
var timeline = new Timeline(timelineWrapper);

if (currentConfig) timeline.loadState(currentConfig);