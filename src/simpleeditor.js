goog.provide('ClosureWidget.SimpleEditor');

goog.require('goog.async.Delay');
goog.require('goog.dom.Range');
goog.require('goog.object');
goog.require('goog.ui.Component');

/**
 * @constructor
 * @param {Object=} opt_options options can include:
 *   text - intial text default to blank string
 *   autosaveTime - time with no activity until save default to 3000
 *   autosave - false if you wish to stop autosaving default to true
 *   cssPrefix - string to prefix class with default none
 *   textPadding - extra white space under text default 30(px)
 * @extends {goog.ui.Component}
 */
ClosureWidget.SimpleEditor = function(opt_options) {
  goog.base(this);

  this.options_ = {
    text: '',
    autosaveTime: 3000,
    autosave: true,
    cssPrefix: null
  };

  goog.object.extend(this.options_, opt_options || {});

  /**
   * the current text.
   * @private
   * @type {string}
   */
  this.text_ = this.options_.text || '';

  /**
   * the test as of last save.
   * @private
   * @type {string}
   */
  this.lastSave_ = this.text_;

  /**
   * the prefix for css clasnames.
   * @private
   * @type {string}
   */
  this.cssPrefix_ = this.options_.cssPrefix ?
      this.options_.cssPrefix + '-' :
      '';

  /**
   * handle of the next change.
   * @private
   */
  this.changeHandler_ = null;

  /**
   * whether the text area is focused.
   * @private
   * @type {boolean}
   */
  this.focused_ = false;

  /**
   * autosaving
   * @private
   */
  this.autosave_ = new goog.async.Delay(
      this.save, this.options_.autosaveTime, this);

  /**
   * The height of the text area
   * @type {number}
   */
  this.editorHeight = 0;

  /**
   * if the text is savable.
   * @private
   * @type {boolean}
   */
  this.canSave_ = false;

  /**
   * if the text is editable.
   * @private
   * @type {boolean}
   */
  this.editable_ = false;

  /**
   * the index of the selection.
   * @private
   * @type {Object}
   */
  this.index_ = {
    start: 0,
    end: 0
  };

  /**
   * The width of the textarea.
   * @private
   * @type {number}
   */
  this.width_ = 0;

  this.textHeight_ = $('<div>')
      .css({
        'position': 'absolute',
        'left': '0',
        'box-sizing': 'border-box',
        'top': '-10000px',
        'border': 0,
        'white-space': 'pre-wrap',
        'word-wrap': 'break-word'
      });
};
goog.inherits(ClosureWidget.SimpleEditor, goog.ui.Component);


/**
 * @enum {string}
 */
ClosureWidget.SimpleEditor.EventType = {
  SAVE: 'save',
  SAVING: 'saving',
  SAVED: 'saved'
};


/**
 * @inheritDoc
 */
ClosureWidget.SimpleEditor.prototype.createDom = function() {
  var $textDisplayEl = $('<div>')
      .addClass(this.cssPrefix_ + goog.getCssName('text-editor-display'));
  this.wrapper = $('<div>')
      .addClass(this.cssPrefix_ + goog.getCssName('text-editor-wrapper'))
      .css({
        'white-space': 'pre-wrap'
      })
      .text(this.text_);
  this.textArea = $('<textarea>')
      .addClass(this.cssPrefix_ + goog.getCssName('text-editor-edit'))
      .val(this.text_)
      .hide();

  $textDisplayEl.append(this.wrapper, this.textArea, this.textHeight_);
  this.setElementInternal($textDisplayEl[0]);
};


/**
 * @inheritDoc
 */
ClosureWidget.SimpleEditor.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.options_.textPadding = this.options_.textPadding ||
      parseFloat(this.textArea.css('line-height')) * 2;

  this.wrapper.click(this.handleClick_, this, this.getHandler());

  this.textHeight_.css('padding', this.textArea.css('padding'));


  this.textArea.focus(this.onFocus_, this, this.getHandler());
  this.textArea.blur(this.onBlur_, this, this.getHandler());

  this.width_ = this.textArea.width();
};


/**
 * @private
 */
ClosureWidget.SimpleEditor.prototype.onFocus_ = function() {
  this.focused_ = true;
  this.changeHandler_ = $$.wait(this.handleChange_, 200, this);
};


/**
 * @private
 */
ClosureWidget.SimpleEditor.prototype.onBlur_ = function() {
  if(!this.focused_)
    return;
  this.focused_ = false;
  $$.clearWait(this.changeHandler_);
  this.handleChange_();
  this.makeUneditable();
};


/**
 * @private
 */
ClosureWidget.SimpleEditor.prototype.handleChange_ = function() {
  this.width_ = this.textArea.width();
  var currentText = this.textArea.val();
  // if the text has changed
  if (this.text_ != currentText) {

    // it is now saveable and start autosaving
    this.canSave_ = true;
    this.autosave_.start();
    this.text_ = currentText;
    this.textHeight_.text(this.text_);
    this.resizeTextArea();

    this.dispatchEvent(ClosureWidget.SimpleEditor.EventType.SAVE);
  }

  if (this.focused)
    this.index_ = this.getInputSelection();

  if (this.editable_)
    this.changeHandler_ = $$.wait(this.handleChange_, 200, this);
};


/**
 * handles a click.
 */
ClosureWidget.SimpleEditor.prototype.handleClick_ = function() {
  
  var r = goog.dom.Range.createFromWindow();
  if (r && r.getStartOffset() != r.getEndOffset()) {
    return;
  }

  this.makeEditable();
};


/**
 * resize the text area.
 */
ClosureWidget.SimpleEditor.prototype.resizeTextArea = function() {
  this.width_ = this.textArea.width();
  this.textHeight_.text(this.text_.replace(/\r/g, ''));
  this.textHeight_.width(this.width_);
  var newHeight = this.textHeight_.height();
  if (newHeight != this.editorHeight) {
    this.editorHeight = newHeight;
    this.textArea.height(newHeight + this.options_.textPadding);
  }
};


/**
 * fires the saving event.
 * @param {Function=} opt_onSave function takes in the current text.
 * @return {boolean} whether it was savable.
 */
ClosureWidget.SimpleEditor.prototype.save = function(opt_onSave) {
  if (this.lastSave_ == this.text_ || !this.canSave_) {
    this.saved();
    return false;
  }
  this.canSave_ = false;
  this.lastSave_ = this.text_;
  this.autosave_.stop();
  if (opt_onSave)
    opt_onSave(this.text_);
  this.dispatchEvent(ClosureWidget.SimpleEditor.EventType.SAVING);
  return true;
};


/**
 * fires the saved event.
 */
ClosureWidget.SimpleEditor.prototype.saved = function() {
  this.dispatchEvent(ClosureWidget.SimpleEditor.EventType.SAVED);
};


/**
 * make the editor editable.
 */
ClosureWidget.SimpleEditor.prototype.makeEditable = function() {
  if (this.editable_)
    return false;
  $(this.getElement()).addClass(goog.getCssName('editable'));
  this.wrapper.hide();
  this.resizeTextArea();
  this.textArea.show();
  this.handleChange_();
  this.textArea[0].focus();
  this.editable_ = true;
  return true;
};


/**
 * makes hte editor uneditable.
 */
ClosureWidget.SimpleEditor.prototype.makeUneditable = function() {
  if (!this.editable_)
    return false;
  $(this.getElement()).removeClass(goog.getCssName('editable'));
  this.save();
  this.wrapper.text(this.text_);
  this.textArea.hide();
  this.wrapper.show();
  this.editable_ = false;
  $$.clearWait(this.changeHandler_);
  return true;
};


/**
 * sets the text if not editable
 * @param {string} text to set.
 * @param {number=} opt_start the index to set the selection to start.
 * @param {number=} opt_end the index to end the selection at.
 * @return {boolean} if setting is succesful.
 */
ClosureWidget.SimpleEditor.prototype.setText = function(
    text, opt_start, opt_end) {
  
  // don't change text if editable
  if (this.editable_)
    return false;

  var start = opt_start || this.index_.start;
  var end = opt_end || this.index_.end;

  this.text_ = text;
  if(this.getElement()) {
    this.textArea.val(text);
    this.setInputSelection(start, end);
    this.wrapper.text(text);
  };
  return true;
};


/**
 * returns the current text.
 * @return {string} the text
 */
ClosureWidget.SimpleEditor.prototype.getText = function() {
  return this.text_;
};


/**
 * sets the selection.
 * @param {number} start index of selection start.
 * @param {number} end index of selection end.
 */
ClosureWidget.SimpleEditor.prototype.setInputSelection = function(start, end) {
    var el = this.textArea[0];
    var offsetToRangeCharacterMove = function(el, offset) {
        return offset - (el.value.slice(0, offset).split('\r\n').length - 1);
    };
    if (typeof el.selectionStart == 'number' &&
        typeof el.selectionEnd == 'number') {
      el.selectionStart = start;
      el.selectionEnd = end;
    } else {
      var range = el.createTextRange();
      var startCharMove = offsetToRangeCharacterMove(el, start);
      range.collapse(true);
      if (start == end) {
        range.move('character', startCharMove);
      } else {
        range.moveEnd('character', offsetToRangeCharacterMove(el, end));
        range.moveStart('character', startCharMove);
      }
      range.select();
    }
};


/**
 * gets the start and end index of the selection.
 * @return {{start: number, end: number}} object with start and end.
 */
ClosureWidget.SimpleEditor.prototype.getInputSelection = function() {
  var start = 0, end = 0, normalizedValue, range,
    textInputRange, len, endRange;
  var el = this.textArea[0];

  if (typeof el.selectionStart == 'number' &&
      typeof el.selectionEnd == 'number') {
    start = el.selectionStart;
    end = el.selectionEnd;
  } else {
    range = document.selection.createRange();

    if (range && range.parentElement() == el) {
      len = el.value.length;
      normalizedValue = el.value.replace(/\r\n/g, '\n');

      // Create a working TextRange that lives only in the input
      textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());

      // Check if the start and end of the selection are at the very end
      // of the input, since moveStart/moveEnd doesn't return what we want
      // in those cases
      endRange = el.createTextRange();
      endRange.collapse(false);

      if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
        start = end = len;
      } else {
        start = -textInputRange.moveStart('character', -len);
        start += normalizedValue.slice(0, start).split('\n').length - 1;

        if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
          end = len;
        } else {
          end = -textInputRange.moveEnd('character', -len);
          end += normalizedValue.slice(0, end).split('\n').length - 1;
        }
      }
    }
  }

  return {
      start: start,
      end: end
  };
};


/**
 * whether the text is uneditable.
 * @return {boolean} whether the text is uneditable.
 */
ClosureWidget.SimpleEditor.prototype.isUneditable = function() {
  return !this.editable_;
};

