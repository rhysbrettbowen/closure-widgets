goog.provide('closureWidgets.DragItem');

goog.require('goog.fx.DragDropItem');



/**
 * add the ability to set a handler to goog.fx.DragDropItem
 *
 * @constructor
 * @extends {goog.fx.DragDropItem}
 * @param {mvc.Control} control to drag.
 * @param {Object=} opt_data to send when dropping.
 */
closureWidgets.DragItem = function(control, opt_data) {
  goog.base(this, control.getElement(), /** @type {Object} */(opt_data));
  this.control_ = control;
  this.isHandler_ = function(el) {
    return true;
  };
};
goog.inherits(closureWidgets.DragItem, goog.fx.DragDropItem);


/**
 * @param {Function} fn to check if the clicked element is the handler.
 */
closureWidgets.DragItem.prototype.setFunctionToGetHandleForDragItem =
    function(fn) {
  this.isHandler_ = fn;
};


/**
 * @private
 * @param {goog.events.BrowserEvent} event mouse down event.
 */
closureWidgets.DragItem.prototype.mouseDown_ = function(event) {
  if (!this.isHandler_(event.target))
    return;
  goog.base(this, 'mouseDown_', event);
};


/**
 * @inheritDoc
 */
closureWidgets.DragItem.prototype.getDraggableElement = function(target) {
  return this.element;
};


