goog.provide('ClosureWidget.Formalize');

goog.require('G');
goog.require('goog.ui.Component');



/**
 * @constructor
 * @extends {goog.ui.Component}
 */
ClosureWidget.Formalize = function() {
  goog.base(this);
  this.textFields = null;
  this.validation = {};
  this.handleErr = G.noop;
  this.submitFunction = G.noop;
};
goog.inherits(ClosureWidget.Formalize, goog.ui.Component);


/**
 * @inheritDoc
 */
ClosureWidget.Formalize.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.textFields = G('input', this.getElement()).filter(function(el) {
    return G(el).attr('type') == 'text';
  });

  // setup placehodlers if IE
  if (goog.userAgent.IE)
    this.setupPlaceholders();

  // remove invalid class when change
  this.textFields.change(function() {
    G(this).removeClass(goog.getCssName('invalid'));
  });

  G(this.getElement()).on(goog.events.EventType.SUBMIT,
      this.onSubmit_, this);
};


/**
 * @param {string} name of input to validate for.
 * @param {Function} fn to validate.
 */
ClosureWidget.Formalize.prototype.addValidation = function(name, fn) {
  this.validation[name] = fn;
};


/**
 * @param {Function} submitFn sunction to run on submit, receives event
 */
ClosureWidget.Formalize.prototype.submitFunction = function(submitFn) {
  this.submitFunction = submitFn;
};


/**
 * @param {Function} fn to handle when a field doesn't validate.
 */
ClosureWidget.Formalize.prototype.handleError = function(fn) {
  this.handleErr = fn;
};


/**
 * @private
 * @param {goog.events.Event} e submit event from the form.
 * @return {boolean} false to stop form submit.
 */
ClosureWidget.Formalize.prototype.onSubmit_ = function(e) {
  var validate = true;
  this.textFields.each(function(el) {
    var Gel = G(el);
    try {
      if (this.validation[Gel.attr('name')])
        this.validation[Gel.attr('name')](Gel.val());
    } catch (err) {
      validate = false;
      Gel.addClass(goog.getCssName('invalid'));
      this.handleErr(err.message, el);
    }
  }, this);
  if (validate) {
    this.submitFunction(e);
  }
  e.preventDefault();
  e.stopPropagation();
  return false;

};


/**
 * sets up placeholders for IE
 */
ClosureWidget.Formalize.prototype.setupPlaceholders = function() {
  this.textFields.each(function(el) {
    var Gel = G(el);
    var container = G('<div/>')
        .css({
          'position': 'relative'
        })
        .append(G('<label for"' + Gel.attr('name') + '">' +
            Gel.attr('placeholder') + '</label>')
                .css({
                  'position': 'absolute',
                  'left': '0px',
                  'padding': '3px 0 0 9px'
                })[0]);
    Gel.replace(container[0]);
    container.append(el);
    Gel.focus(function() {
      G(this).prev().hide();
    });
    Gel.blur(function() {
      if (G(this).val() === '')
        G(this).prev().show();
    });
  });
};
