goog.provide('ClosureWidgets.InfoPopup');

goog.require('goog.ui.Component');
goog.require('ClosureWidget.Template.InfoPopup');
goog.require('G');



/**
 * @constructor
 * @extends {goog.ui.Component}
 * @param {Object=} opt_options
 */
ClosureWidgets.InfoPopup = function(opt_options) {
    goog.base(this);
    this.$popupHtml = $(ClosureWidget.Template.InfoPopup.main(null, null))
        .hide();
    this.timeout = 0;
    this.timer = null;
    this.anchor_ = null;
    this.lastShow = -1;
    this.lastHide = -1;
};
goog.inherits(ClosureWidgets.InfoPopup, goog.ui.Component);

ClosureWidgets.InfoPopup.prototype.decorateInternal = function(el) {
  this.$popupHtml.appendTo(document.body);
  this.anchor_ = el;
  goog.base(this, 'decorateInternal', this.$popupHtml[0]);
};

ClosureWidgets.InfoPopup.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  $(this.anchor_).click(goog.bind(this.setVisible, this, true),
      this, this.getHandler());
};


ClosureWidgets.InfoPopup.prototype.getContentElement = function() {
  return this.$popupHtml.find(goog.getCssName('-cw-container'))[0];
};


ClosureWidgets.InfoPopup.prototype.setContent = function(html) {
  $(goog.getCssName('-cw-container'), this.getElement())
      .empty()
      .append($(html));
};


ClosureWidgets.InfoPopup.prototype.isVisible = function() {
  return this.$popupHtml.visible();
}


ClosureWidgets.InfoPopup.prototype.setVisible = function(visible) {
  if (visible)
    this.show();
  else
    this.hide();
}


/**
 */
ClosureWidgets.InfoPopup.prototype.reposition = function() {
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
ClosureWidgets.InfoPopup.prototype.show = function() {
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
ClosureWidgets.InfoPopup.prototype.hide = function() {
  if(!this.isVisible())
    return;
  $$.off(this.close_);
  this.$popupHtml.hide();
  this.lastHideTime_ = goog.now();
};
