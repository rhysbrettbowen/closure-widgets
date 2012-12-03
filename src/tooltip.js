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

goog.provide('ClosureWidget.Tooltip');

goog.require('goog.positioning.AnchoredViewportPosition');
goog.require('goog.ui.Component');
goog.require('goog.ui.Popup');

/**
 * Custom widget for displaying popover
 *
 * @param {Element} opt_contentEle
 * @param {Element} opt_anchorEle
 * @param {goog.positioning.Corner=} opt_pos
 * @extends {goog.ui.Component}
 * @constructor
 */
ClosureWidget.Tooltip = function(opt_contentEle, opt_anchorEle, opt_pos) {
    goog.ui.Component.call(this);
    if (goog.isDefAndNotNull(opt_anchorEle)) {
        this.anchorElement_ = opt_anchorEle;
    }
    this.pos_ = opt_pos;
    this.timeOut = 1000;

    if (goog.isDefAndNotNull(opt_contentEle)) {
        this.contentEle_ = opt_contentEle;
    }
    goog.events.listen(opt_anchorEle, goog.events.EventType.MOUSEOVER, function() {
        this.setVisible(true);
    }, false, this);
    goog.events.listen(opt_anchorEle, goog.events.EventType.MOUSEOUT, function() {
        this.setVisible(false);
    }, false, this);
    this.visTimer = null;
};
goog.inherits(ClosureWidget.Tooltip, goog.ui.Component);

ClosureWidget.Tooltip.prototype.anchorElement_ = null;
ClosureWidget.Tooltip.prototype.popup_ = null;
ClosureWidget.Tooltip.prototype.contentEle_ = null;
ClosureWidget.Tooltip.prototype.margin_ = null;

/** {@inheritDoc} */
ClosureWidget.Tooltip.prototype.createDom = function() {
    this.ele = goog.dom.createDom('div', goog.getCssName('popover'));
    //var arrow = goog.dom.createDom('div', goog.getCssName('popuppanel-toparrow'));
    //ele.appendChild(arrow);
    //goog.dom.classes.add(arrow, goog.getCssName("popover-arrow"));
    if (goog.dom.isNodeLike(this.contentEle_)) {
        this.ele.appendChild(this.contentEle_);
    }

    return this.decorateInternal(this.ele);
};

/** {@inheritDoc} */
ClosureWidget.Tooltip.prototype.enterDocument = function() {
        if (goog.userAgent.GECKO || goog.userAgent.OPERA) {
            var popupArrow = goog.dom.getElementsByTagNameAndClass(null,
                    goog.getCssName('popup-arrow'), this.getContentElement())[0];
            if (popupArrow) {
                popupArrow.style.letterSpacing = '-6px';
                popupArrow.style.lineHeight = '6px';
                popupArrow.style.right = '29px';
            }
        }

        this.popup_ = new goog.ui.Popup(this.getContentElement());
        this.popup_.setHideOnEscape(true);
        this.popup_.setAutoHide(true);
        this.popup_.setVisible(false);
        this.popup_.setPinnedCorner(goog.positioning.Corner.TOP_RIGHT);
        if (this.margin_) {
            this.popup_.setMargin(this.margin_);
        } else {
            this.popup_.setMargin(new goog.math.Box(0, 0, 20, 0));
        }

        this.popup_.setPosition(new goog.positioning.AnchoredViewportPosition(
                this.anchorElement_, (this.pos_ || goog.positioning.Corner.BOTTOM_END), true));

        this.popup_.setVisible(true);
        this.popup_.setVisible(false);
};

/** {@inheritDoc} */
ClosureWidget.Tooltip.prototype.exitDocument = function() {
    ClosureWidget.Tooltip.superClass_.exitDocument.call(this);

    if (goog.isDefAndNotNull(this.popup_)) {
        this.popup_.dispose();
    }
};

ClosureWidget.Tooltip.prototype.setVisible = function(visible) {
    if (goog.isDefAndNotNull(this.popup_)) {
        if(!this.visTimer) {
          if(visible) {
            this.visTimer = goog.Timer.callOnce(function() {
                this.popup_.setVisible(visible);
                this.visTimer = null;
            }, this.timeOut, this);
          } else {
            this.popup_.setVisible(visible);
          }
        } else if (!visible){
          goog.Timer.clear(this.visTimer);
          this.visTimer = null;
          this.popup_.setVisible(visible);
        }
    }
};

ClosureWidget.Tooltip.prototype.isOrWasRecentlyVisible = function() {
    if (goog.isDefAndNotNull(this.popup_)) {
        return this.popup_.isOrWasRecentlyVisible();
    } else {
        return false;
    }
};

ClosureWidget.Tooltip.prototype.setAnchorElement = function(element) {
    this.anchorElement_ = element;
    this.popup_.setPosition(new goog.positioning.AnchoredViewportPosition(
            this.anchorElement_, (this.pos_ || goog.positioning.Corner.BOTTOM_END), true));
};

ClosureWidget.Tooltip.prototype.getAnchorElement = function() {
    return this.anchorElement_;
};

ClosureWidget.Tooltip.prototype.setMargin = function(margin) {
    this.margin_ = margin;

    if (goog.isDefAndNotNull(this.popup_)) {
        this.popup_.setMargin(this.margin_);
    }
};

ClosureWidget.Tooltip.prototype.getMargin = function() {
    return this.margin_ || new goog.math.Box(0, 0, 20, 0);
};

ClosureWidget.Tooltip.prototype.setContent = function(element) {

    if (goog.isDefAndNotNull(this.popup_)) {
        goog.dom.removeChildren(this.ele);
        goog.dom.append(this.ele, element);
        //this.popup_.setElement(this.getContentElement());

    } else {
        // if popup_ has not been created yet
        goog.dom.appendChild(this.getContentElement(), element);
    }
};

ClosureWidget.Tooltip.prototype.getContent = function() {
    if (goog.isDefAndNotNull(this.popup_)) {
        return this.popup_.getElement();
    } else {
        return this.getContentElement();
    }
};
