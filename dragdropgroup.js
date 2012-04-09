goog.provide('closureWidgets.DragDropGroup');
goog.require('closureWidgets.DragItem');

goog.require('goog.fx.DragDropGroup');



/**
 * @constructor
 * @extends {goog.fx.DragDropGroup}
 */
closureWidgets.DragDropGroup = function() {
  goog.base(this);
  this.setDragClass(goog.getCssName('activeDrag'));
  this.isSource_ = true;
};
goog.inherits(closureWidgets.DragDropGroup, goog.fx.DragDropGroup);


/**
 * @param {goog.ui.Component} element the control to add.
 * @param {Object=} opt_data the data to pass on drop.
 */
closureWidgets.DragDropGroup.prototype.addItem = function(
    element, opt_data) {
  var item = new closureWidgets.DragItem(element,
      /** @type {Object} */(opt_data));
  var getHandler = function(el) {
    return !!goog.dom.getAncestorByClass(el,
        goog.getCssName('flipcard-draghandle'));
  };
  item.setFunctionToGetHandleForDragItem(getHandler);
  this.addDragDropItem(item);
};


/**
 * @param {Element} el the element to be dragged.
 * @param {goog.fx.DragDropItem} item to be dragged.
 * @return {Element} element to show being dragged.
 */
closureWidgets.DragDropGroup.prototype.createDragElement = function(
    el, item) {
  if (item.control_.selected_) {
    var children = item.control_.getParent().getSelected();
    var multi = goog.dom.createDom('DIV', 'multi-move',
        children.length + ' item(s)');
    return multi;
  }
  return goog.base(this, 'createDragElement', el);
};


/**
 * @inheritDoc
 */
closureWidgets.DragDropGroup.prototype.startDrag = function(event, item) {

  // Prevent a new drag operation from being started if another one is already
  // in progress (could happen if the mouse was released outside of the
  // document).
  if (this.dragItem_) {
    return;
  }

  this.dragItem_ = item;

  // Dispatch DRAGSTART event
  var dragStartEvent = new goog.fx.DragDropEvent(
      goog.fx.AbstractDragDrop.EventType.DRAGSTART, this, this.dragItem_);
  if (this.dispatchEvent(dragStartEvent) === false) {
    dragStartEvent.dispose();
    this.dragItem_ = null;
    return;
  }
  dragStartEvent.dispose();

  // Get the source element and create a drag element for it.
  var el = item.getCurrentDragElement();
  this.dragEl_ = this.createDragElement(el, item);
  var doc = goog.dom.getOwnerDocument(el);
  doc.body.appendChild(this.dragEl_);

  this.dragger_ = this.createDraggerFor(el, this.dragEl_, event);
  this.dragger_.setScrollTarget(this.scrollTarget_);

  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.DRAG,
                     this.moveDrag_, false, this);

  goog.events.listen(this.dragger_, goog.fx.Dragger.EventType.END,
                     this.endDrag, false, this);

  // IE may issue a 'selectstart' event when dragging over an iframe even when
  // default mousemove behavior is suppressed. If the default selectstart
  // behavior is not suppressed, elements dragged over will show as selected.
  goog.events.listen(doc.body, goog.events.EventType.SELECTSTART,
                     this.suppressSelect_);

  this.recalculateDragTargets();
  this.recalculateScrollableContainers();
  this.activeTarget_ = null;
  this.initScrollableContainerListeners_();
  this.dragger_.startDrag(event);

  event.preventDefault();
};


/**
 * This is overriding the base to allow passing the original event
 *
 * @inheritDoc
 */
closureWidgets.DragDropGroup.prototype.endDrag = function(event) {
  var activeTarget = event.dragCanceled ? null : this.activeTarget_;
  if (activeTarget && activeTarget.target_) {
    var clientX = event.clientX;
    var clientY = event.clientY;
    var scroll = this.getScrollPos();
    var x = clientX + scroll.x;
    var y = clientY + scroll.y;

    var subtarget;
    // If a subtargeting function is enabled get the current subtarget
    if (this.subtargetFunction_) {
      subtarget = this.subtargetFunction_(activeTarget.item_,
          activeTarget.box_, x, y);
    }

    var dragEvent = new goog.fx.DragDropEvent(
        goog.fx.AbstractDragDrop.EventType.DRAG, this, this.dragItem_,
        activeTarget.target_, activeTarget.item_, activeTarget.element_,
        clientX, clientY, x, y);
    this.dispatchEvent(dragEvent);
    dragEvent.dispose();

    var dropEvent = new goog.fx.DragDropEvent(
        goog.fx.AbstractDragDrop.EventType.DROP, this, this.dragItem_,
        activeTarget.target_, activeTarget.item_, activeTarget.element_,
        clientX, clientY, x, y);
    dropEvent.origEvent = event;
    activeTarget.target_.dispatchEvent(dropEvent);
    dropEvent.dispose();
  }

  var dragEndEvent = new goog.fx.DragDropEvent(
      goog.fx.AbstractDragDrop.EventType.DRAGEND, this, this.dragItem_);
  this.dispatchEvent(dragEndEvent);
  dragEndEvent.dispose();

  goog.events.unlisten(this.dragger_, goog.fx.Dragger.EventType.DRAG,
                       this.moveDrag_, false, this);
  goog.events.unlisten(this.dragger_, goog.fx.Dragger.EventType.END,
                       this.endDrag, false, this);
  var doc = goog.dom.getOwnerDocument(this.dragItem_.getCurrentDragElement());
  goog.events.unlisten(doc.body, goog.events.EventType.SELECTSTART,
                       this.suppressSelect_);


  this.afterEndDrag(this.activeTarget_ ? this.activeTarget_.item_ : null);
};

