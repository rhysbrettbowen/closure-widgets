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
};
goog.inherits(ClosureWidget.ImageGallery, goog.ui.Component);


/**
 * @enum {number}
 */
ClosureWidget.ImageGallery.Sizes = {
  MAIN_WIDTH: 600,
  MAIN_HEIGHT: 400,
  SMALL_WIDTH: 32,
  SMALL_HEIGHT: 32,
  SMALL_MARGIN: 5,
  PADDING: 10
};


/**
 * @inheritDoc
 */
ClosureWidget.ImageGallery.prototype.createDom = function() {
  this.element = $('<div/>').addClass(goog.getCssName('imagegallery'));
  this.mainView = $('<div><div/></div>')
      .css({
        'height': ClosureWidget.ImageGallery.Sizes.MAIN_HEIGHT + 'px',
        'width': ClosureWidget.ImageGallery.Sizes.MAIN_WIDTH + 'px',
        'position': 'relative'
      });
  this.mainView.children()
      .addClass(goog.getCssName('imagegallery-medium'))
      .css({
        'opacity': '1'
      });
  this.gallery = $('<div/>')
      .addClass(goog.getCssName('imagegallery-gallery'));
  this.element.append(this.mainView[0], this.gallery[0]);
  this.setElementInternal(this.element[0]);
};


/**
 * @inheritDoc
 */
ClosureWidget.ImageGallery.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
};


/**
 * @param {Array.<{small:string,medium:string}>} images models.
 */
ClosureWidget.ImageGallery.prototype.addImages = function(images) {
  goog.array.extend(this.images, images);
  goog.Timer.callOnce(function() {
    $(images).each(function(img) {
      var preload = new Image();
      preload.src = img.medium;
    });
  }, 15);
};


/**
 * @return {{small: string, medium: string}} the current image.
 */
ClosureWidget.ImageGallery.prototype.currentImage = function() {
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
  var small = ClosureWidget.ImageGallery.Sizes.SMALL_MARGIN * 2 +
      ClosureWidget.ImageGallery.Sizes.SMALL_WIDTH;
  var middle = ClosureWidget.ImageGallery.Sizes.MAIN_WIDTH / 2 - small / 2;
  this.gallery.empty();
  $(this.images).each(function(img, ind) {
    var imgEl = $('<img/>')
        .addClass(goog.getCssName('imagegallery-small'))
        .attr('src', img.small)
        .css({
          'left': (middle + (ind * small)) + 'px'
        });
    imgEl.click(function() {
      this.scrollToIndex(ind);
    }, this);
    imgEl.mouseover(function() {
      $(this).addClass(goog.getCssName('hover'));
    });
    imgEl.mouseout(function() {
      goog.Timer.callOnce(function() {
        $(this).removeClass(goog.getCssName('hover'));
      }, 100, this);
    });
    this.gallery.append(imgEl);
  }, this);
  this.scrollToIndex(opt_ind || 0);
  if (this.images.length)
    this.mainView.children().css({
      'background': "url('" +
          this.images[0].medium +
          "') no-repeat 50% 50%",
      'background-size': 'contain'
    });
};


/**
 * scroll the gallery to the image index
 *
 * @param {number} index of the image.
 */
ClosureWidget.ImageGallery.prototype.scrollToIndex = function(index) {
  if (index >= this.images.length) {
    index = 0;
  }
  this.currentImage = index;
  var small = ClosureWidget.ImageGallery.Sizes.SMALL_MARGIN * 2 +
      ClosureWidget.ImageGallery.Sizes.SMALL_WIDTH;
  var middle = ClosureWidget.ImageGallery.Sizes.MAIN_WIDTH / 2 - small / 2;
  var largeImage = $('<div/>')
          .addClass(goog.getCssName('imagegallery-medium'));
  largeImage.css({
    'background': "url('" + this.images[index].medium + "') no-repeat 50% 50%",
    'opacity': '0'
  });
  this.mainView.children().css({
    'opacity': '0'
  });
  this.mainView.append(largeImage);
  this.gallery.children().each(function(el, childInd) {
    $(el).css('left', (middle + (childInd * small) - (index * small)) + 'px');
  });
  largeImage.top();
  largeImage.css({
    'opacity': '1'
  });
  goog.Timer.callOnce(function() {
    this.mainView.children().filter(':last', null, true).detach();
  }, 1000, this);
};


/**
 * @return {number} the number of images in the gallery.
 */
ClosureWidget.ImageGallery.prototype.getLength = function() {
  return this.images.length;
};
