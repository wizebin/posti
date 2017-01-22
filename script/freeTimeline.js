var FreeTimeline = function(parent, props) {
  var that = me(this);
  this.view = spawn('div', parent, { className: 'timelineview' });

  this.cards = [];

  this.cardCounter = 0;

  this.controlView = spawn('div', this.view, { className: 'maincontrols' });
  this.controlRow = spawn('div', this.controlView, { className: 'buttoncontrols' });

  this.primary = spawn('div', this.view, { className: 'timelineprimary' });
  this.canvas = spawn('canvas', this.primary, { className: 'timelinecanvas' });
  this.cardView = spawn('div', this.primary, { className: 'abscardwrapper', ondrop: function(ev) { that.droppedOnTimeline(ev) }, ondragover: function(ev) { that.timelineDraggedOver(ev) } });

  this.addButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.addCard();
  } }, 'Add Step');

  this.actButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.act();
  } }, 'Perform');

  this.link = spawn('a', this.controlView, { className: 'statelink', onmouseover: function(){that.setStateLink()}, onfocus: function(){that.setStateLink()}}, 'State Link');

  this.addCard('CONFIG');
}

FreeTimeline.prototype.closeCard = function(card, force) {
  if (card) {
    abandon(card.view);
    var position = this.cards.indexOf(card);
    if (position !== -1) {
      this.cards.splice(position, 1);
    }
  }
  if (this.cards.length === 0) {
    this.cardCounter = 0;
    if (!force) {
      this.addCard('CONFIG');
    }
  }
  this.setOrdinality();
}

FreeTimeline.prototype.timelineDraggedOver = function(event) {
  event.preventDefault();
  var wrapperOffset = getOffsetRect(this.cardView);

  var offsetX = getMousePos().x - wrapperOffset.x - this.dragging.clickOff.x;//this.draggingMouseOffset.x - this.cardView.getBoundingClientRect().left;
  var offsetY = getMousePos().y - wrapperOffset.y - this.dragging.clickOff.y;//this.draggingMouseOffset.y - this.cardView.getBoundingClientRect().top;
  this.dragging.view.style.position = 'absolute';
  this.dragging.view.style.top = `${offsetY}px`;
  this.dragging.view.style.left = `${offsetX}px`;
  this.dragging.view.style.margin = '0px 0px';
  this.dragging.view.style.resize = 'both';
}
FreeTimeline.prototype.droppedOnTimeline = function(event) {
  console.log('dropped on timeline', this.dragging, event, this.draggingMouseOffset);

}

FreeTimeline.prototype.cardStartingDrag = function(card, event) {
  // event.dataTransfer.setDragImage(null);
  this.dragging = card;
}

FreeTimeline.prototype.cardDraggedOver = function(card, event) {
  this.cards.forEach(function(icard){
    icard.view.className = (icard === card && icard != this.dragging) ? 'dropcardview' : 'cardview';
  }, this);
}

FreeTimeline.prototype.droppedOnCard = function(card, event) {
  if (this.dragging && this.drqagging != card) {
    event.stopPropagation();
    var cardPosition = this.cards.indexOf(this.dragging);
    var dropPosition = this.cards.indexOf(card);

    if (dropPosition > -1) {
      if (dropPosition > cardPosition) {
        this.dragging.view.parentElement.insertBefore(this.dragging.view, card.view.nextSibling);
      }
      else {
        this.dragging.view.parentElement.insertBefore(this.dragging.view, card.view);
      }
      arrayMove(this.cards, cardPosition, dropPosition);
    }
    this.setOrdinality();
  }
}

FreeTimeline.prototype.cardStoppedDrag = function(card, event) {
  this.cards.forEach(function(card){
    card.view.className = 'cardview';
  });
  var that = this;
}

FreeTimeline.prototype.addCard = function(initialCard) {
  var that = this;
  var nextCard = new Card(this.cardView, { id: `CARD_${this.cardCounter++}`, onClose: that.closeCard, initialCard, draggable: true, ondragstart: function(ev){
    that.cardStartingDrag(nextCard, ev);
  }, ondrop: function(ev){
    that.droppedOnCard(nextCard, ev);
  }, ondragover: function(ev){
    ev.preventDefault();
    that.cardDraggedOver(nextCard, ev);
  }, ondragend: function(ev){
    that.cardStoppedDrag(nextCard, ev);
  }, style: { position: 'absolute', top: '10px', left: '10px' } } );
  this.cards.push(nextCard);
  this.setOrdinality();
  return nextCard;
}

FreeTimeline.prototype.clear = function() {
  for(var a = this.cards.length-1; a >= 0; a--) {
    this.closeCard(this.cards[a], true);
  }
}

FreeTimeline.prototype.loadState = function(stateString) {
  this.clear();
  try {
    JSON.parse(stateString).forEach(function(cardstate){
      var buf = this.addCard();
      buf.loadState(cardstate);
    }, this);
  } catch (err) {
    err.desc = 'timeline state load json error';
    console.error(err);
  }
}

FreeTimeline.prototype.setStateLink = function() {
  this.link.href = '#' + b64EncodeUnicode(this.saveState());
}

FreeTimeline.prototype.saveState = function() {
  return JSON.stringify(this.cards.map(function(card){
    return card.saveState();
  }));
}

FreeTimeline.prototype.flow = function(promiseList, step) {
  if (step >= promiseList.length) return undefined;
  var that = this;
  promiseList[step]().then(function(data){
    var nextStep = step+1;
    that.flow(promiseList, nextStep);
  }).catch(function(data){
    console.log('chain stopped at', step, data);
  });
}

FreeTimeline.prototype.setOrdinality = function() {
  this.cards.forEach(function(card, ord) {
    card.setOrdinal(ord+1);
  });
}

FreeTimeline.prototype.act = function() {
  this.flow(this.cards.map(function(card){return card.act}), 0);
}