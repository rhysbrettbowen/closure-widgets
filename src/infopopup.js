goog.provide('ClosureWidget.InfoPopup');

goog.require('goog.ui.Component');
goog.require('ClosureWidget.Template.InfoPopup');
goog.require('G');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {Object=} opt_options
 */
ClosureWidget.InfoPopup = function(opt_options) {
    goog.base(this);
    this.$popupHtml = $(ClosureWidget.Template.InfoPopup.main(null, null))
        .hide();
    this.timeout = 0;
    this.timer = null;
    this.anchor_ = null;
    this.lastShow = -1;
    this.lastHide = -1;
    this.shown = false;
};
goog.inherits(ClosureWidget.InfoPopup, goog.ui.Component);

ClosureWidget.InfoPopup.prototype.decorateInternal = function(el) {
  this.anchor_ = el;
  goog.base(this, 'decorateInternal', this.$popupHtml[0]);
};

ClosureWidget.InfoPopup.prototype.enterDocument = function() {

  
  goog.base(this, 'enterDocument');

  $(this.anchor_).click(goog.bind(this.setVisible, this, true),
      this, this.getHandler());
};


ClosureWidget.InfoPopup.prototype.getContentElement = function() {
  return this.$popupHtml.find(goog.getCssName('-cw-container'))[0];
};


ClosureWidget.InfoPopup.prototype.setContent = function(html) {
  $(goog.getCssName('-cw-container'), this.getElement())
      .empty()
      .append($(html));
};


ClosureWidget.InfoPopup.prototype.isVisible = function() {
  return this.$popupHtml.visible();
}


ClosureWidget.InfoPopup.prototype.setVisible = function(visible) {
  if (visible)
    this.show();
  else
    this.hide();
}


/**
 */
ClosureWidget.InfoPopup.prototype.reposition = function() {
  if(!this.anchor_)
    return;
  var rect = $(this.anchor_).position();
  var width = this.$popupHtml.width();
  this.$popupHtml
      .left(rect.left - (width - rect.width) / 2)
      .top(rect.top + rect.height);
};


/**
 */
ClosureWidget.InfoPopup.prototype.show = function() {
  if(!this.shown)
    this.$popupHtml.appendTo(document.body);
  this.shown = true;
  if (this.isVisible())
    return;
  this.reposition();
  this.close_ = $(document).on(goog.events.EventType.MOUSEDOWN, function(e) {
      if (!$(this.getElement()).has(e.target).size())
        this.hide();
    }, this, this.getHandler(), true);
  this.$popupHtml.show();
  this.lastShowTime_ = goog.now();
  this.lastHideTime_ = -1;
};


/**
 */
ClosureWidget.InfoPopup.prototype.hide = function() {
  if(!this.isVisible())
    return;
  $$.off(this.close_);
  this.$popupHtml.hide();
  this.lastHideTime_ = goog.now();
};
