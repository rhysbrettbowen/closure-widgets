/*******************************************************************************
********************************************************************************
**                                                                            **
**  Copyright (c) 2012 Catch.com, Inc.                                        **
**                                                                            **
**  Licensed under the Apache License, Version 2.0 (the "License");           **
**  you may not use this file except in compliance with the License.          **
**  You may obtain a copy of the License at                                   **
**                                                                            **
**      http://www.apache.org/licenses/LICENSE-2.0                            **
**                                                                            **
**  Unless required by applicable law or agreed to in writing, software       **
**  distributed under the License is distributed on an "AS IS" BASIS,         **
**  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  **
**  See the License for the specific language governing permissions and       **
**  limitations under the License.                                            **
**                                                                            **
********************************************************************************
*******************************************************************************/

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


