goog.provide('closureWidgets.SlidePanel');

goog.require('goog.ui.Component');
goog.require('G');


/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {Object} pos ition for the slide panel.
 * @param {string=} opt_class to add to slide panel.
 */
closureWidgets.SlidePanel = function(pos, opt_class) {
  goog.base(this);
  this.pos = pos;
  this.opt_class = opt_class;
};
goog.inherits(closureWidgets.SlidePanel, goog.ui.Component);


/**
 * @enum {Object}
 */
closureWidgets.SlidePanel.Position = {
  TOP: {
    'top': '-50px',
    'height': '50px',
    'left': '25%',
    'width': '50%'
  },
  RIGHT: {
    'top': '25%',
    'height': '50%',
    'right': '-50px',
    'width': '50px'
  },
  BOTTOM: {
    'bottom': '-50px',
    'height': '50px',
    'left': '25%',
    'width': '50%'
  },
  LEFT: {
    'top': '25%',
    'height': '50%',
    'left': '-50px',
    'width': '50px'
  }
};


/**
 * @inheritDoc
 */
closureWidgets.SlidePanel.prototype.createDom = function() {
  this.el = G('<div/>')
      .addClass(goog.getCssName('slidepanel'))
      .css(this.pos);
  if (this.opt_class)
    this.el.addClass(this.opt_class);
  this.setElementInternal(this.el[0]);
  this.dummyEl = G('<div/>')
      .addClass(goog.getCssName('slidepanel'))
      .css(this.pos)
      .css('background', 'transparent');
  switch (this.pos) {
    case closureWidgets.SlidePanel.Position.TOP:
      this.dummyEl.top('0px');
      break;
    case closureWidgets.SlidePanel.Position.RIGHT:
      this.dummyEl.css({'right': '0px'});
      break;
    case closureWidgets.SlidePanel.Position.BOTTOM:
      this.dummyEl.css({'bottom': '0px'});
      break;
    case closureWidgets.SlidePanel.Position.LEFT:
      this.dummyEl.left('0px');
      break;
  }
  G(document.body).append(this.dummyEl[0]);
};


/**
 * @inheritDoc
 */
closureWidgets.SlidePanel.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.el.top(); // forces page to draw el so it will animate
  this.show();
};


/**
 * @param {Element} el that contains the content.
 */
closureWidgets.SlidePanel.prototype.setContent = function(el) {
  this.el.append(el);
};


/**
 * @return {Element} element that can be used for drop target.
 */
closureWidgets.SlidePanel.prototype.getDummyEl = function() {
  return this.dummyEl[0];
};


/**
 * slide in to view
 */
closureWidgets.SlidePanel.prototype.show = function() {
  switch (this.pos) {
    case closureWidgets.SlidePanel.Position.TOP:
      this.el.top('0px');
      break;
    case closureWidgets.SlidePanel.Position.RIGHT:
      this.el.css({'right': '0px'});
      break;
    case closureWidgets.SlidePanel.Position.BOTTOM:
      this.el.css({'bottom': '0px'});
      break;
    case closureWidgets.SlidePanel.Position.LEFT:
      this.el.left('0px');
      break;
  }
};


/**
 * @param {number=} opt_time until dispose.
 */
closureWidgets.SlidePanel.prototype.hide = function(opt_time) {
  switch (this.pos) {
    case closureWidgets.SlidePanel.Position.TOP:
      this.el.top('-50px');
      break;
    case closureWidgets.SlidePanel.Position.RIGHT:
      this.el.css({'right': '-50px'});
      break;
    case closureWidgets.SlidePanel.Position.BOTTOM:
      this.el.css({'bottom': '-50px'});
      break;
    case closureWidgets.SlidePanel.Position.LEFT:
      this.el.left('-50px');
      break;
  }
  this.dummyEl.removeNode();
  goog.Timer.callOnce(this.dispose, opt_time || 1000, this);
};
