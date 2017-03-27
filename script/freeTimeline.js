var FreeTimeline = function(parent, props) {
  var that = me(this);
  this.view = spawn('div', parent, { className: 'timelineview' });

  this.cards = [];

  this.cardCounter = 0;

  this.controlView = spawn('div', this.view, { className: 'maincontrols' });
  this.controlRow = spawn('div', this.controlView, { className: 'buttoncontrols' });

  this.primary = spawn('div', this.view, { className: 'timelineprimary' });
  this.cardView = spawn('div', this.primary, { className: 'abscardwrapper', ondrop: function(ev) { that.droppedOnTimeline(ev) }, ondragover: function(ev) { that.timelineDraggedOver(ev) }, onscroll: that.drawLines, onmousemove: that.onMoveMouse });
  this.canvas = spawn('canvas', this.cardView, { className: 'timelinecanvas', onselectstart: function() { return false; }, onmousedown: that.startSelection });

  this.addButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.addCard();
  } }, 'Add Step');

  this.actButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.act();
  } }, 'Perform');

  this.rearrangeButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.rearrange();
  } }, 'Rearrange Cards');

  this.link = spawn('a', this.controlView, { className: 'statelink', onmouseover: function(){that.setStateLink()}, onfocus: function(){that.setStateLink()}}, 'State Link');

  this.addCard('CONFIG');

  this.dragCounter = 0;

  this.selectedCards = [];

  this.selectionStart = null;

  this.selectionBox = spawn('div', this.cardView, { style: { display: 'none', backgroundColor: '#f00', opacity: '.4', position: 'absolute', zIndex: 100 }, onselectstart: function() { return false; } });

  window.addEventListener ("mouseup", function () { that.finishSelection(); }, false);
}

function collide(boxa, boxb) {
  return !(
    boxa.x > boxb.x + boxb.w ||
    boxb.x > boxa.x + boxa.w ||
    boxa.y > boxb.y + boxb.h ||
    boxb.y > boxa.y + boxa.h
  );
}

function getBoxFromPoints(pointa, pointb) {
  var ret = { x: 0, y: 0, w: 0, h: 0 };

  if (pointa.x < pointb.x) {
    ret.x = pointa.x;
    ret.w = pointb.x - pointa.x;
  } else {
    ret.x = pointb.x;
    ret.w = pointa.x - pointb.x;
  }

  if (pointa.y < pointb.y) {
    ret.y = pointa.y;
    ret.h = pointb.y - pointa.y;
  } else {
    ret.y = pointb.y;
    ret.h = pointa.y - pointb.y;
  }

  return ret;
}

FreeTimeline.prototype.onMoveMouse = function(ev) {
  if (this.selectionStart !== null) {
    ev.preventDefault();
    var curSelection = getRelativeMousePos(this.cardView);
    var scrolls = getElementScroll(this.cardView);
    curSelection.x += scrolls.x;
    curSelection.y += scrolls.y;

    var box = getBoxFromPoints(this.selectionStart, curSelection);
    this.selectedCards = this.getCardsInBox(box);
    this.displaySelectedCards();

    this.selectionBox.style.left = `${box.x}px`;
    this.selectionBox.style.top = `${box.y}px`;
    this.selectionBox.style.width = `${box.w}px`;
    this.selectionBox.style.height = `${box.h}px`;
    this.selectionBox.style.display = 'block';

  }
}

FreeTimeline.prototype.startSelection = function(ev) {
  ev.preventDefault();
  this.selectionStart = getRelativeMousePos(this.cardView);
  var scrolls = getElementScroll(this.cardView);
  this.selectionStart.x += scrolls.x;
  this.selectionStart.y += scrolls.y;
}

FreeTimeline.prototype.finishSelection = function() {
  if (this.selectionStart !== null) {
    var curSelection = getRelativeMousePos(this.cardView);
    var scrolls = getElementScroll(this.cardView);
    curSelection.x += scrolls.x;
    curSelection.y += scrolls.y;

    var box = getBoxFromPoints(this.selectionStart, curSelection);

    this.selectedCards = this.getCardsInBox(box);
    this.displaySelectedCards();

    this.selectionStart = null;
    this.selectionBox.style.left = '0px';
    this.selectionBox.style.top = '0px';
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';
    this.selectionBox.style.display = 'none';
  }
}

FreeTimeline.prototype.displaySelectedCards = function() {
  this.cards.forEach(function(card){
    card.view.className = 'cardview';
  });

  this.selectedCards.forEach(function(card){
    card.view.className = 'selectedcardview';
  });
}

FreeTimeline.prototype.getCardsInBox = function(box) {
  return this.cards.reduce(function(result, card) {
    if (collide(box, getPositionInParent(card.view))) {
      result.push(card);
    }
    return result;
  }, []);
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
    if (this.selectedCards.length > 0) {
      var wrapperOffset = getOffsetRect(this.cardView);
      var wrapperScroll = getElementScroll(this.cardView);

      this.selectedCards.forEach(function(card) {
        var offsetX = getMousePos().x - wrapperOffset.x + wrapperScroll.x - card.clickOff.x;//cardMouseOffset.x - this.cardView.getBoundingClientRect().left;
        var offsetY = getMousePos().y - wrapperOffset.y + wrapperScroll.y - card.clickOff.y;//cardMouseOffset.y - this.cardView.getBoundingClientRect().top;
        card.view.style.position = 'absolute';
        card.view.style.top = `${offsetY}px`;
        card.view.style.left = `${offsetX}px`;
        card.view.style.margin = '0px 0px';
      });
    } else if (this.dragging && this.dragging.constructor.name === 'Card'){
      var wrapperOffset = getOffsetRect(this.cardView);
      var wrapperScroll = getElementScroll(this.cardView);

      var offsetX = getMousePos().x - wrapperOffset.x + wrapperScroll.x - this.dragging.clickOff.x;//this.draggingMouseOffset.x - this.cardView.getBoundingClientRect().left;
      var offsetY = getMousePos().y - wrapperOffset.y + wrapperScroll.y - this.dragging.clickOff.y;//this.draggingMouseOffset.y - this.cardView.getBoundingClientRect().top;
      this.dragging.view.style.position = 'absolute';
      this.dragging.view.style.top = `${offsetY}px`;
      this.dragging.view.style.left = `${offsetX}px`;
      this.dragging.view.style.margin = '0px 0px';
    }
    if (this.dragCounter++ % 3 === 0) {
      this.drawLines();
    }
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
      icard.view.className = (icard === card && icard != this.dragging) ? 'dropcardview' : ((this.selectedCards.indexOf(icard) !== -1) ? 'selectedcardview' : 'cardview');
    }, this);
  }
}

FreeTimeline.prototype.droppedOnCard = function(card, event) {
  if (this.dragging && this.dragging != card) {
    if (this.ordering) {
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
  var that = this;
  this.ordering = false;
  this.dragging = null;
  this.drawLines();
}

FreeTimeline.prototype.cardAction = function(card, action) {
  this.drawLines();
}

FreeTimeline.prototype.closeSelectedCards = function(card, force) {
  var that = this;
  if (this.selectedCards.length > 0) {
    this.selectedCards.forEach(function(card){
      that.closeCard(card, force);
    });
    this.selectedCards = [];
  } else {
    that.closeCard(card, force);
  }
}

FreeTimeline.prototype.addCard = function(initialCard) {
  var that = this;
  var prevOff = this.cards.length > 0 ? getPositionInParent(this.cards[this.cards.length-1].view) : { x: 10, y: 0, w: 0, h: 0};
  var nextTop = prevOff.y + prevOff.h + 10;
  var nextLeft = prevOff.x;

  var nextCard = new Card(this.cardView, { id: `CARD_${this.cardCounter++}`, onClose: that.closeSelectedCards, onAction: that.cardAction, initialCard, _draggable: true,
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
  }, notifyMouseDown: function(card, controlPressed) {
    that.onMousedownNotification(card, controlPressed);
  }, notifyMouseUp: function(card, controlPressed) {
    controlPressed && that.addSelectedCard(card);
  }, timeline: this,
  _style: { cursor: 'move' },
  style: { position: 'absolute', top: `${nextTop}px`, left: `${nextLeft}px` } } );
  this.cards.push(nextCard);
  this.setOrdinality();
  this.drawLines();
  return nextCard;
}

FreeTimeline.prototype.rearrange = function() {
  var curx = 0;
  var prevOff = { x: 0, y: 10, w: 0, h: 0 };
  var timelineOff = getOffsetRect(this.view);

  var cardWidth = (timelineOff.w / 3) - 10;
  var cardHeight = (timelineOff.h / 5) - 10;

  var lowest = 0;

  this.cards.forEach(function(card) {
    var curSize = getElementSize(card.view)
    var nextTop = prevOff.y ;
    var nextLeft = prevOff.x + prevOff.w + 10;

    if (prevOff.x + prevOff.w + curSize.w + 10 > timelineOff.w) {
      nextTop = lowest + 10;
      nextLeft = 10;
    }

    card.view.style.top = `${nextTop}px`;
    card.view.style.left = `${nextLeft}px`;

    prevOff = getPositionInParent(card.view);
    if (lowest < prevOff.y + prevOff.h) {
      lowest = prevOff.y + prevOff.h;
    }
  });
  this.drawLines();
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
      this.drawLines();
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

FreeTimeline.prototype.findCardNamed = function(name) {
  for(var a = 0; a < this.cards.length; a++) {
    if (this.cards[a].getName() === name) return this.cards[a];
  }
  return undefined;
}

FreeTimeline.prototype.executeCardNamed = function(name) {
  var card = this.findCardNamed(name);
  if (card === undefined) return undefined;

  return card.act();
}

FreeTimeline.prototype.flow = function(promiseList, step) {
  if (step >= promiseList.length) return undefined;
  var that = this;
  promiseList[step]().then(function(data){
    if (isObject(data)) {
      if(data.nextstep !== undefined) {
        if (isString(data.nextstep)) {
          //find card with title
        } else if (isNumber(data.nextstep)) {
          return that.flow(promiseList, data.nextstep);
        } else if (isFunc(data.nextstep)) {
          return that.flow()
        } else if (data.nextstep === false) {
          return undefined;
        }
      }
    }
    var nextStep = step+1;
    return that.flow(promiseList, nextStep);
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

    var grad= context.createLinearGradient(line.start.x, line.start.y, line.end.x, line.end.y);
    grad.addColorStop(0, "#fafafa");
    grad.addColorStop(1, line.enabled ? '#333' : '#caa');

    context.strokeStyle = grad;

    context.lineWidth = 3; // ord+1;
    context.moveTo(line.start.x, line.start.y);
    context.lineTo(line.end.x, line.end.y);
    context.stroke();
  });
}

FreeTimeline.prototype.addSelectedCard = function(selectedCard) {
  var index = this.selectedCards.indexOf(selectedCard);

  if (index !== -1) {
    this.selectedCards.splice(index, 1);
    selectedCard.view.className = 'cardview';
  } else {
    this.selectedCards.push(selectedCard);
    selectedCard.view.className = 'selectedcardview';
  }
}

// This function tells the other selected cards to store the current offset from the mouse so all of them can move at once
FreeTimeline.prototype.onMousedownNotification = function(snitchCard, controlPressed, shiftPressed) {
  var that = this;
  if (this.selectedCards.length > 0) {
    var containsCard = false;
    this.selectedCards.forEach(function(card){
      card.setClickOffset();
      if (card === snitchCard) containsCard = true;
    });
    if (!containsCard && !controlPressed) {
      this.selectedCards = [];
      this.cards.forEach(function(card){
        card.view.className = 'cardview';
      });
    }
  }
}

FreeTimeline.prototype.act = function() {
  this.flow(this.cards.map(function(card){return card.act}), 0);
}