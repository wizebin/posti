var mousex = null;
var mousey = null;
function onDocumentMouseMove(e){
  mousex=document.all ? window.event.clientX : e.pageX;
  mousey=document.all ? window.event.clientY : e.pageY;
}
function onDocumentMouseDragMove(e) {
    e = e || window.event;
    mousex = e.pageX;
    mousey = e.pageY;
}
document.ondragover=onDocumentMouseDragMove;
document.onmousemove=onDocumentMouseMove;
function getMousePos(){
  return { x: mousex, y: mousey };
}

var currentConfig = null;

var hashLocation = window.location.hash.split('#');

if (hashLocation.length > 1) {
  var result = b64DecodeUnicode(hashLocation[1]);
  currentConfig=result;
}

var timelineWrapper = spawn('div', document.getElementById('main'), { style: { display: 'flex', height: '100%' }});
var timeline = new FreeTimeline(timelineWrapper);

if (currentConfig) timeline.loadState(currentConfig);