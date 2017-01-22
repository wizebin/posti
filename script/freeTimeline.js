var FreeTimeline = function(parent, props) {
  var that = me(this);
  this.view = spawn('div', parent, { className: 'timelineview' });

  this.cards = [];

  this.cardCounter = 0;

  this.controlView = spawn('div', this.view, { className: 'maincontrols' });
  this.controlRow = spawn('div', this.controlView, { className: 'buttoncontrols' });

  this.primary = spawn('div', this.view, { className: 'timelineprimary' });
  this.cardView = spawn('div', this.primary, { className: 'abscardwrapper', ondrop: function(ev) { that.droppedOnTimeline(ev) }, ondragover: function(ev) { that.timelineDraggedOver(ev) }, onscroll: that.drawLines });
  this.canvas = spawn('canvas', this.cardView, { className: 'timelinecanvas' });

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
  this.drawLines();
}

FreeTimeline.prototype.timelineDraggedOver = function(event) {
  if (!this.ordering) {
    event.preventDefault();
    if (this.dragging && this.dragging.constructor.name === 'Card'){
      var wrapperOffset = getOffsetRect(this.cardView);
      var wrapperScroll = getElementScroll(this.cardView);

      var offsetX = getMousePos().x - wrapperOffset.x - this.dragging.clickOff.x + wrapperScroll.x;//this.draggingMouseOffset.x - this.cardView.getBoundingClientRect().left;
      var offsetY = getMousePos().y - wrapperOffset.y - this.dragging.clickOff.y + wrapperScroll.y;//this.draggingMouseOffset.y - this.cardView.getBoundingClientRect().top;
      this.dragging.view.style.position = 'absolute';
      this.dragging.view.style.top = `${offsetY}px`;
      this.dragging.view.style.left = `${offsetX}px`;
      this.dragging.view.style.margin = '0px 0px';
    }
    this.drawLines();
  }
}
FreeTimeline.prototype.droppedOnTimeline = function(event) {

  console.log('dropped on timeline', this.dragging, event, this.draggingMouseOffset);

}

FreeTimeline.prototype.cardStartingDrag = function(card, event) {
  this.dragging = card;
  this.ordering = false;
}

FreeTimeline.prototype.orderStartingDrag = function(card, event) {
  this.dragging = card;
  this.ordering = true;
}

FreeTimeline.prototype.cardDraggedOver = function(card, event) {
  if (this.ordering) {
    this.cards.forEach(function(icard){
      icard.view.className = (icard === card && icard != this.dragging) ? 'dropcardview' : 'cardview';
    }, this);
  }
}

FreeTimeline.prototype.droppedOnCard = function(card, event) {
  if (this.dragging && this.dragging != card) {
    if (!this.ordering) {

    } else {
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
    this.drawLines();
  }
}

FreeTimeline.prototype.cardStoppedDrag = function(card, event) {
  this.cards.forEach(function(card){
    card.view.className = 'cardview';
  });
  var that = this;
  this.ordering = false;
  this.dragging = null;
  this.drawLines();
}

FreeTimeline.prototype.cardAction = function(card, action) {
  this.drawLines();
}

FreeTimeline.prototype.addCard = function(initialCard) {
  var that = this;
  var off = getOffsetRect(this.cardView);
  var prevOff = this.cards.length > 0 ? getPositionInParent(this.cards[this.cards.length-1].view) : { x: off.x, y: off.y, w: 0, h: 0};
  var nextTop = prevOff.y + prevOff.h + 10;
  var nextLeft = prevOff.x;

  var nextCard = new Card(this.cardView, { id: `CARD_${this.cardCounter++}`, onClose: that.closeCard, onAction: that.cardAction, initialCard, _draggable: true,
  _ondragstart: function(ev) {
    that.cardStartingDrag(nextCard, ev);
  }, _ondragorderstart: function(ev) {
    that.orderStartingDrag(nextCard, ev);
  }, ondrop: function(ev) {
    that.droppedOnCard(nextCard, ev);
  }, ondragover: function(ev) {
    ev.preventDefault();
    that.cardDraggedOver(nextCard, ev);
  }, _ondragend: function(ev) {
    that.cardStoppedDrag(nextCard, ev);
  }, _style: { cursor: 'move' },
  style: { position: 'absolute', top: `${nextTop}px`, left: `${nextLeft}px` } } );
  this.cards.push(nextCard);
  this.setOrdinality();
  this.drawLines();
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

FreeTimeline.prototype.drawLines = function() {
  var lines = [];
  var cardOff = getOffsetRect(this.cardView);
  var cardScroll = getElementScroll(this.cardView);
  this.canvas.style.top = `${cardScroll.y}px`;
  this.canvas.style.left = `${cardScroll.x}px`;
  for(var a = 0; a < this.cards.length; a++) {
    var pos = getPositionInParent(this.cards[a].view);
    var center = { x: pos.x + pos.w/2 - cardScroll.x, y: pos.y + pos.h/2 - cardScroll.y };
    if (a > 0) {
      lines[lines.length-1].end = center;
      lines[lines.length-1].enabled = this.cards[a].isEnabled();
    }
    if (a < this.cards.length - 1) {
      lines.push({ start: center });
    }
  }

  var context=this.canvas.getContext("2d");

  if (this.canvas.width != cardOff.w || this.canvas.height != cardOff.h) {
    this.canvas.width = cardOff.w;
    this.canvas.height = cardOff.h;
  }

  context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  lines.forEach(function(line, ord) {
    context.beginPath();
    context.strokeStyle = line.enabled ? '#333' : '#caa';
    context.lineWidth = ord+1;
    context.moveTo(line.start.x, line.start.y);
    context.lineTo(line.end.x, line.end.y);
    context.stroke();
  });
}

FreeTimeline.prototype.act = function() {
  this.flow(this.cards.map(function(card){return card.act}), 0);
}