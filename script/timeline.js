var Timeline = function(parent, props) {
  var that = me(this);
  this.view = spawn('div', parent, objectAssign({ className: 'timelineview' }, props));

  this.cards = [];

  this.cardCounter = 0;

  this.controlView = spawn('div', this.view, { className: 'maincontrols' });
  this.controlRow = spawn('div', this.controlView, { className: 'buttoncontrols' });

  this.cardView = spawn('div', this.view, { className: 'cardwrapper' });

  this.addButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.addCard();
  } }, 'Add Step');

  this.actButton = spawn('button', this.controlRow, { className: 'controlbutton', onclick: function() {
    that.act();
  } }, 'Perform');

  this.link = spawn('a', this.controlView, { className: 'statelink', onmouseover: function(){that.setStateLink()}, onfocus: function(){that.setStateLink()}}, 'State Link');

  this.addCard('CONFIG');
}

Timeline.prototype.closeCard = function(card, force) {
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

Timeline.prototype.startingDrag = function(card, event) {
  this.dragging = card;
}

Timeline.prototype.beingDraggedOver = function(card, event) {
  this.cards.forEach(function(icard){
    icard.view.className = (icard === card && icard != this.dragging) ? 'dropcardview' : 'cardview';
  }, this);
}

Timeline.prototype.dropped = function(card, event) {
  if (this.dragging && this.dragging != card) {
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

Timeline.prototype.stoppedDrag = function(card, event) {
  this.cards.forEach(function(card){
    card.view.className = 'cardview';
  });
}

Timeline.prototype.addCard = function(initialCard) {
  var that = this;
  var nextCard = new Card(this.cardView, { id: `CARD_${this.cardCounter++}`, onClose: that.closeCard, initialCard, draggable: true, ondragstart: function(ev){
    that.startingDrag(nextCard, ev);
  }, ondrop: function(ev){
    that.dropped(nextCard, ev);
  }, ondragover: function(ev){
    ev.preventDefault();
    that.beingDraggedOver(nextCard, ev);
  }, ondragend: function(ev){
    that.stoppedDrag(nextCard, ev);
  } });
  this.cards.push(nextCard);
  this.setOrdinality();
  return nextCard;
}

Timeline.prototype.clear = function() {
  for(var a = this.cards.length-1; a >= 0; a--) {
    this.closeCard(this.cards[a], true);
  }
}

Timeline.prototype.loadState = function(stateString) {
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

Timeline.prototype.setStateLink = function() {
  this.link.href = '#' + b64EncodeUnicode(this.saveState());
}

Timeline.prototype.saveState = function() {
  return JSON.stringify(this.cards.map(function(card){
    return card.saveState();
  }));
}

Timeline.prototype.flow = function(promiseList, step) {
  if (step >= promiseList.length) return undefined;
  var that = this;
  promiseList[step]().then(function(data){
    var nextStep = step+1;
    that.flow(promiseList, nextStep);
  }).catch(function(data){
    console.log('chain stopped at', step, data);
  });
}

Timeline.prototype.setOrdinality = function() {
  this.cards.forEach(function(card, ord) {
    card.setOrdinal(ord+1);
  });
}

Timeline.prototype.act = function() {
  this.flow(this.cards.map(function(card){return card.act}), 0);
}