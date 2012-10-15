goog.provide('ClosureWidget.DropDown');

goog.require('G');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.Menu');
goog.require('goog.ui.SubMenu');



/**
 *  setup a popup element
 *
 * @constructor
 * @extends {goog.ui.PopupMenu}
 * @param {Element} element to anchor
 * @param {Element|Object} structure the menu structure
 */
ClosureWidget.DropDown = function(element, structure) {
  goog.base(this);
  this.handlers = [];
  if (goog.isObject(structure)) {
    structure = this.objectToDom_(structure);
    $(element).after(structure);
  }
  if(structure) {
    this.setClassForMenu_(structure);
    this.decorate(structure);
  }
  this.baseEl = structure;
  if(!this.baseEl) {
    this.baseEl = $('<div>').addClass(goog.getCssName('goog-menu'))[0];
    $(element).after(this.baseEl);
  }
  this.currentBase = this.baseEl;
  this.attach(
        element,
        goog.positioning.Corner.BOTTOM_LEFT);
};
goog.inherits(ClosureWidget.DropDown, goog.ui.PopupMenu);


/**
 * This will set the classes and setup the div structure properly.
 * 
 * @param {Element} menuEl structure to set classes for.
 */
ClosureWidget.DropDown.prototype.setClassForMenu_ = function(menuEl) {
  $(menuEl).addClass(goog.getCssName('goog-menu'))
      .children().each(function(el) {
        var $children = $(el).children();
        if($children.length) {
          var $menu = $('<div>').addClass('goog-submenu');
          $menu.append($children);
          $(el).append($menu);
          this.setClassForMenu_($menu[0]);
        } else {
          $(el).addClass(goog.getCssName('goog-menuitem'));
        }
      }, this);
};


/**
 * this will return a dom string of the 
 * 
 * @param {Object} obj describing the menu
 * @return {Element} the menu structure in divs
 */
ClosureWidget.DropDown.prototype.objectToDom_ = function(obj) {
  var el = $('<div>').addClass(goog.getCssName('goog-menu'));
  goog.object.forEach(obj, function(val, key) {
    if(goog.isFunction(val)) {
      this.handlers.push(val);
      el.append(
        $('<div>')
            .addClass(goog.getCssName('goog-menuitem'))
            .text(key)
            .data('act', this.handlers.length)
        );
    } else if (goog.isObject(val)) {
      var sub = $('<div>')
          .addClass(goog.getCssName('goog-submenu'))
          .text(key);
      sub.append(this.objectToDom_(val));
      el.append(sub);
    } 
  }, this);
  return el[0];
};

ClosureWidget.DropDown.prototype.add = function(name, func) {
  this.handlers.push(func);
  $(this.currentBase).append(
      $("<div>").addClass(goog.getCssName("goog-menuitem"))
          .html(name).data('act', this.handlers.length));
  return this;
};

ClosureWidget.DropDown.prototype.sub = function(name) {
  var sub = $('<div>').addClass(goog.getCssName('goog-menu'));
  $(this.currentBase).append(
      $("<div>")
          .addClass(goog.getCssName("goog-submenu"))
          .html(name)
          .append(sub)
      );
  this.currentBase = sub[0];
  return this;
};


ClosureWidget.DropDown.prototype.start = function() {
  this.currentBase = this.baseEl;
};

ClosureWidget.DropDown.prototype.end = function() {
  this.currentBase = $(this.currentBase).parent().parent()[0];
  return this;
};

ClosureWidget.DropDown.prototype.done = function() {
  this.decorate(this.baseEl);
};

ClosureWidget.DropDown.prototype.handleAction = function(e) {
  this.handleAction_(e);
};

ClosureWidget.DropDown.prototype.handleAction_ = function(e) {
  var num = $(e.target.getElement()).data('act');
  if (num)
    this.handlers[num - 1](e);
};

ClosureWidget.DropDown.prototype.decorateInternal = function(element) {
  goog.base(this, 'decorateInternal', element);
  $(this).on(goog.ui.Component.EventType.ACTION, this.handleAction, this,
    this.getHandler());
};

