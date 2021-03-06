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

goog.provide('ClosureWidget.Formalize');

goog.require('$');
goog.require('$$');
goog.require('ClosureWidget.Templates.Formalize');
goog.require('goog.ui.Component');
goog.require('goog.dom.TagName');



/**
 * @constructor
 * @param {Element} form the form element to decorate.
 * @param {Object=} opt_options
 * @extends {goog.ui.Component}
 */
ClosureWidget.Formalize = function(form, opt_options) {
  goog.base(this);
  var options = {
    validators: {},
    error: goog.bind(function(err) {
      var $error = $(ClosureWidget.Templates.Formalize.errorMessage(err, null));
      this.errorHandlers_.push($(err.input).focus(function() {
        $(this).removeClass(goog.getCssName('invalid'));
      }), this);
      this.errorHandlers_.push($error.click(function(e) {
        if (!$(e.target).hasClass(goog.getCssName('cw-close')))
          err.input.focus();
        else
          $(e.target).parent().removeNode(); 
      }));
      $(this.messageDiv)
          .append($error);
    }, this),
    submit: $$.noop,
    message: undefined
  };
  this.errorHandlers_ = [];
  goog.object.extend(options, opt_options || {});
  this.textFields = null;
  this.validation = options.validators;
  this.handleErr = options.error;
  this.submitFn = options.submit;
  this.messageDiv = options.message;
  this.decorate(form);
};
goog.inherits(ClosureWidget.Formalize, goog.ui.Component);


/**
 * @inheritDoc
 */
ClosureWidget.Formalize.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.textFields = $('input', this.getElement()).filter(function(el) {
    return $(el).attr('type') == 'text';
  }).add($('textarea'), this.getElement());

  this.selects = $('select');

  // setup placehodlers if IE
  if (goog.userAgent.IE)
    this.setupPlaceholders();

  // remove invalid class when change
  this.textFields.change(function() {
    $(this).removeClass(goog.getCssName('invalid'));
  });

  $(this.getElement()).on(goog.events.EventType.SUBMIT,
      this.onSubmit_, this, this.getHandler());

};


/**
 * @inheritDoc
 */
ClosureWidget.Formalize.prototype.canDecorate = function(el) {
  return el.tagName == goog.dom.TagName.FORM;
};


/**
 * @param {string} name of input to validate for.
 * @param {Function} fn to validate.
 * @param {Object=} opt_handler
 */
ClosureWidget.Formalize.prototype.addValidation = function(
    name, fn, opt_handler) {
  this.validation[name] = goog.bind(fn, opt_handler || this);
};


/**
 * @param {Function} submitFn function to run on submit.
 * @param {Object=} opt_handler
 */
ClosureWidget.Formalize.prototype.submitFunction = function(
    submitFn, opt_handler) {
  this.submitFn = goog.bind(submitFn, opt_handler || this);
};


/**
 * @param {Function} fn to handle when a field doesn't validate.
 * @param {Object=} opt_handler
 */
ClosureWidget.Formalize.prototype.handleError = function(
    fn, opt_handler) {
  this.handleErr = goog.bind(fn, opt_handler || this);
};


/**
 * @private
 * @param {goog.events.Event} e submit event from the form.
 * @return {boolean} false to stop form submit.
 */
ClosureWidget.Formalize.prototype.onSubmit_ = function(e) {
  var validate = true;
  $$.off(this.errorHandlers_);
  this.errorHandlers_ = [];
  $(this.messageDiv).empty();
  this.textFields.add(this.selects).each(function(el) {
    var $el = $(el);
    var err = {input: el};
    if (this.validation[$el.attr('name')]) 
      err.message = this.validation[$el.attr('name')]($el.val());
    if(err.message) {
      validate = false;
      $el.addClass(goog.getCssName('invalid'));
      this.handleErr(err, el);
    }
  }, this);
  if (validate && this.submitFn) {
    var values = {};
    var getVal = function(obj, field) {
      obj[$(field).attr('name')] = $(field).val();
      return obj;
    };
    goog.array.reduce(this.textFields, getVal, values);
    goog.array.reduce(this.selects, getVal, values);
    this.submitFn(values);
  }
  e.preventDefault();
  e.stopPropagation();
  return false;

};


ClosureWidget.Formalize.prototype.reset = function() {
  $$.off(this.errorHandlers_);
  this.errorHandlers_ = [];
  $(this.messageDiv).empty();
  this.textFields
      .val('')
      .removeClass(goog.getCssName('invalid'));
};


/**
 * sets up placeholders for IE
 */
ClosureWidget.Formalize.prototype.setupPlaceholders = function() {
  this.textFields.each(function(el) {
    var $el = $(el);
    if (!$el.attr('placeholder'))
      return;
    $el.addClass(goog.getCssName('placeholder'));
    $el.val($el.attr('placeholder'));
    $el.focus(function() {
      if ($el.hasClass(goog.getCssName('placeholder'))) {
        $el.val('').removeClass(goog.getCssName('placeholder'));
      }
    }, this, this.getHandler());
    $el.blur(function() {
      if ($el.val() == '') {
        $el.val($el.attr('placeholder'))
            .addClass(goog.getCssName('placeholder'));
      }
    }, this, this.getHandler());
  }, this);
};
