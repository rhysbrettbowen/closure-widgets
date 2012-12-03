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

goog.provide('ClosureWidget.Helpers');

goog.require('G');
goog.require('goog.ui.Popup');
goog.require('goog.object');
goog.require('goog.Timer');


/**
 * @constructor
 */
ClosureWidget.Helpers = function() {

  this.messages = {};
  this.mouseover = null;
  this.mouseout = null;
  this.running = false;
  this.$el = $('<div>')
      .addClass('cw-helper');
  this.$el.appendTo(document.body);
  this.timer = null;
  this.currEl = null;

  this.popup_ = new goog.ui.Popup(this.$el[0]);
  this.popup_.setHideOnEscape(true);
  this.popup_.setAutoHide(true);
  this.popup_.setVisible(false);
  this.popup_.setPinnedCorner(goog.positioning.Corner.TOP_RIGHT);
  this.popup_.setMargin(new goog.math.Box(0, 0, 20, 0));

  this.popup_.setVisible(true);
  this.popup_.setVisible(false);

};

ClosureWidget.Helpers.prototype.add = function(selector, message) {
  this.messages[selector] = message;
};

ClosureWidget.Helpers.prototype.start = function() {
  
  if (this.running)
    return;
  this.running = true;

  goog.events.listen(document.body, 'mouseover', this.onMouseOver_,
      false, this);
  goog.events.listen(document.body, 'mouseout', this.onMouseOut_,
      false, this);

};

ClosureWidget.Helpers.prototype.stop = function() {
  
  this.running = false;
  
  goog.events.unlistenByKey(this.mouseover);
  goog.events.unlistenByKey(this.mouseout);

};

ClosureWidget.Helpers.prototype.onMouseOver_ = function(e) {

  if (this.currEl)
    return;

  var message = goog.object.findValue(this.messages, function(val, key) {
    return $$.matches(e.target, key);
  });

  if (!message)
    return;

  if (goog.isFunction(message))
    message = message();

  this.$el.text(message);
  this.currEl = e.target;

  this.popup_.setPosition(new goog.positioning.AnchoredViewportPosition(
      e.target, (goog.positioning.Corner.BOTTOM_END), true));

  this.timer = goog.Timer.callOnce(function() {
    this.popup_.setVisible(true);
    this.timer = null;
  }, 1000, this);

};

ClosureWidget.Helpers.prototype.onMouseOut_ = function(e) {
  if(e.target != this.currEl)
    return;

  goog.Timer.clear(this.timer);
  this.timer = null;
  this.popup_.setVisible(false);
  this.currEl = null;
};
