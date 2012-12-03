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

goog.provide('closureWidgets.ContextMenu');

goog.require('goog.ui.PopupMenu');



/**
 * @constructor
 * @extends {goog.ui.PopupMenu}
 */
closureWidgets.ContextMenu = function() {
  goog.base(this);
  this.activeTarget_ = null;
  this.setToggleMode(true);
  this.controls_ = [];
  this.handlers_ = {};
};
goog.inherits(closureWidgets.ContextMenu, goog.ui.PopupMenu);


/**
 * @inheritDoc
 */
closureWidgets.ContextMenu.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  goog.events.listen(this, goog.ui.Component.EventType.ACTION,
      this.onMenu_, false, this);
};


/**
 * @param {goog.ui.Component} control to attach the menu to.
 */
closureWidgets.ContextMenu.prototype.attach = function(control) {
  this.controls_.push({el: control.getElement(), control: control});
  goog.base(this, 'attach', control.getElement(), undefined, undefined, true);
};


/**
 * @private
 * @param {goog.events.Event} e the click event.
 */
closureWidgets.ContextMenu.prototype.onMenu_ = function(e) {
  if (this.handlers_[e.target.content_])
    goog.bind(this.handlers_[e.target.content_], this.activeTarget_)(e);
};


/**
 * @param {string} name text to go in context menu.
 * @param {Function} action function to run when clicked.
 */
closureWidgets.ContextMenu.prototype.addMenuItem = function(name, action) {
  var item = new goog.ui.MenuItem(name);
  this.handlers_[name] = action;
  this.addChild(item, true);
};


/**
 * @private
 * @param {goog.events.Event} e the click event.
 */
closureWidgets.ContextMenu.prototype.onTargetClick_ = function(e) {
  var keys = this.targets_.getKeys();
  var filter = function(el) {
    return el.el == e.currentTarget;
  };
  for (var i = 0; i < keys.length; i++) {
    var target = /** @type {Object} */(this.targets_.get(keys[i]));
    if (target.element_ == e.currentTarget) {
      this.showMenu(target,
                    /** @type {number} */ (e.clientX),
                    /** @type {number} */ (e.clientY));
      this.activeTarget_ = goog.array.find(filter).control;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }
};
