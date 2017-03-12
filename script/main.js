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
var leftbar = spawn('div', timelineWrapper, { style: { flex: '0 0 200px', backgroundColor: '#e6e6e6', overflowY: 'auto' } });
var timeline = new FreeTimeline(timelineWrapper);

var nameWrapper = spawn('div', leftbar, { style: { display: 'flex', paddingTop: '10px' } }, [
  nameField = spawn('input', null, { style: { marginLeft: '10px', padding: '5px', width: '100%' }, placeholder: 'Current Name' }),
  saveCurrent = spawn('button', null, { className: 'controlbutton', onclick: function() {
    if (nameField.value !== '') {
      var rawList = localStorage.getItem('saved');
      var list = JSON.parse(rawList) || {};
      list[nameField.value] = { config: timeline.saveState() };
      rawList = JSON.stringify(list);
      localStorage.setItem('saved', rawList);
      loadLocalList();
    }
  } }, 'Save')
]);

var localList = spawn('ul', leftbar, { style: { listStyle: 'none', padding: '0px' } });

function loadLocalList() {
  var rawList = localStorage.getItem('saved');
  try{
    var list = JSON.parse(rawList);
    removeAllChildren(localList);
    var keys = getObjectKeys(list).sort();
    keys.forEach(function(name){
      spawn('li', localList, { style: { marginBottom: '4px', display: 'flex', alignItems: 'stretch' } }, [
        spawn('div', null, { className: 'controlbutton', style: { flex: '1', marginRight: '0px' }, onclick: function(){
          nameField.value = name;
          timeline.loadState(list[name].config);
        } }, name),
        spawn('button', null, { style: { height: '20px', width: '20px', alignSelf: 'center', margin: '5px' }, className: 'cardclose', onclick: function() {
          var rawList = localStorage.getItem('saved');
          var list = JSON.parse(rawList) || {};
          delete(list[name]);
          rawList = JSON.stringify(list);
          localStorage.setItem('saved', rawList);
          loadLocalList();
        } }, 'X'),
      ]);
    });
  } catch (err) {

  }

}

loadLocalList();

if (currentConfig) timeline.loadState(currentConfig);