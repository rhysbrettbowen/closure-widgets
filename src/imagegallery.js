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

goog.provide('ClosureWidget.ImageGallery');

goog.require('G');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
ClosureWidget.ImageGallery = function() {
  goog.base(this);
  this.images = [];
  this.currentImage = 0;
  this.controlContent = null;
};
goog.inherits(ClosureWidget.ImageGallery, goog.ui.Component);


/**
 * @enum {number}
 */
ClosureWidget.ImageGallery.Sizes = {
  MAIN_WIDTH: 600,
  MAIN_HEIGHT: 400,
  SMALL_WIDTH: 48,
  SMALL_HEIGHT: 48,
  SMALL_MARGIN: 6,
  PADDING: 12
};


/**
 * @inheritDoc
 */
ClosureWidget.ImageGallery.prototype.createDom = function() {
  this.element = $('<div/>').addClass(goog.getCssName('cw-imagegallery'));
  this.mainView = $('<div/>')
      .addClass(goog.getCssName('cw-imagegallery-display'));
  this.mainView.append(
      $('<div>')
          .addClass(goog.getCssName('cw-imagegallery-cell'))
          .append(
              G('<img>')
                  .addClass(goog.getCssName('cw-imagegallery-medium'))
              .css({
                'opacity': '1'
              })
          )
      );
  this.gallery = $('<div/>')
      .addClass(goog.getCssName('cw-imagegallery-gallery'));
  this.element.append(this.mainView[0], this.gallery[0]);
  this.setElementInternal(this.element[0]);
};


/**
 * @param {goog.dom.Appendable} content to put in control bar.
 */
ClosureWidget.ImageGallery.prototype.setControl = function(content) {
  this.controlContent = content;
};


/**
 * @inheritDoc
 */
ClosureWidget.ImageGallery.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.element.click(function(e) {
    if($(e.target).hasClass(goog.getCssName('cw-imagegallery-cell')))
      $(this.element).hide();
  }, this);

  this.mainView.click(function() {
    this.scrollToIndex((this.currentImage + 1) % this.images.length);
  }, this);
};


/**
 * @param {Array.<{small:string,medium:string}>} images models.
 */
ClosureWidget.ImageGallery.prototype.addImages = function(images) {
  goog.array.extend(this.images, images);
  // $$.wait(function() {
  //   $(images).each(function(img) {
  //     var preload = new Image();
  //     preload.src = img.medium;
  //   });
  // }, 15);
};


/**
 * @return {{small: string, medium: string}} the current image.
 */
ClosureWidget.ImageGallery.prototype.getCurrentImage = function() {
  return this.images[this.currentImage];
};


/**
 * @param {{small: string, medium: string}} image to remove.
 * @return {boolean} whether it was succesful.
 */
ClosureWidget.ImageGallery.prototype.remove = function(image) {
  if (G(this.images).contains(image)) {
    G(this.images).remove(image);
    this.showImages(this.currentImage);
    return true;
  }
  return false;
};


/**
 * clears the gallery
 */
ClosureWidget.ImageGallery.prototype.clear = function() {
  this.images = [];
  this.mainView.children().removeNode();
  this.gallery.children().removeNode();
  this.currentImage = 0;
};


/**
 * show the images.
 *
 * @param {number=} opt_ind to scroll to.
 */
ClosureWidget.ImageGallery.prototype.showImages = function(opt_ind) {
  ClosureWidget.ImageGallery.Sizes.MAIN_WIDTH = this.gallery.width();
  var small = ClosureWidget.ImageGallery.Sizes.SMALL_MARGIN * 2 +
      ClosureWidget.ImageGallery.Sizes.SMALL_WIDTH;
  var middle = ClosureWidget.ImageGallery.Sizes.MAIN_WIDTH / 2 - small / 2;
  this.gallery.empty();
  $(this.images).each(function(img, ind) {
    var imgEl = $('<img/>')
        .addClass(goog.getCssName('cw-imagegallery-small'))
        .attr('src', img.small)
        .css({
          'left': (middle + (ind * small)) + 'px'
        });
    imgEl.click(function() {
      if (img != this.getCurrentImage())
        this.scrollToIndex(ind);
    }, this);
    imgEl.mouseover(function() {
      $(this).addClass(goog.getCssName('hover'));
    });
    imgEl.mouseout(function() {
      $$.wait(function() {
        $(this).removeClass(goog.getCssName('hover'));
      }, 100, this);
    });
    this.gallery.append(imgEl);
  }, this);
  this.scrollToIndex(opt_ind || 0);
  if (this.images.length)
    this.mainView.children().attr('src', this.images[0].medium);
};


/**
 * scroll the gallery to the image index
 *
 * @param {number} index of the image.
 */
ClosureWidget.ImageGallery.prototype.scrollToIndex = function(index) {
  if (!this.images.length)
    return;
  if (index >= this.images.length) {
    index = 0;
  }
  ClosureWidget.ImageGallery.Sizes.MAIN_WIDTH = this.gallery.width();
  this.currentImage = index;
  var small = ClosureWidget.ImageGallery.Sizes.SMALL_MARGIN * 4 +
      ClosureWidget.ImageGallery.Sizes.SMALL_WIDTH;
  var middle = ClosureWidget.ImageGallery.Sizes.MAIN_WIDTH / 2 - small / 2;
  var container = $('<div>')
          .addClass(goog.getCssName('cw-imagegallery-cell'))
          .append(
              G('<img>')
                  .addClass(goog.getCssName('cw-imagegallery-medium'))
          );
  var largeImage = container.children();
  largeImage
      .attr('src', this.images[index].medium)
      .css('opacity', '0');
  this.mainView.children().children().css({
    'opacity': '0'
  });
  $$.wait(function() {
    this.mainView.empty();
    this.mainView.append(container);
    largeImage.top();
    largeImage.css({
      'opacity': '1'
    });
  }, 500, this);

  
  this.gallery.children().each(function(el, childInd) {
    $(el)
        .toggleClass(goog.getCssName('active'), function() {
          return childInd == index;
        })
        .css('left', (middle + (childInd * small) - (index * small)) + 'px');
  });


};


/**
 * @return {number} the number of images in the gallery.
 */
ClosureWidget.ImageGallery.prototype.getLength = function() {
  return this.images.length;
};
