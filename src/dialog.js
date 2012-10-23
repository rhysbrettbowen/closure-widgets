goog.provide('ClosureWidget.Dialog');

goog.require('ClosureWidget.template.Dialog');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.Dialog.ButtonSet');
goog.require('goog.ui.Zippy');
goog.require('goog.json');
goog.require('goog.net.cookies');

/**
 * @constructor
 * @param {string=} opt_id ID for the type of dialog (uses this for "do not
  *    show again").
 * @extends {goog.ui.Dialog}
 */
ClosureWidget.Dialog = function(opt_id) {
    goog.base(this, '', false);
    this.setButtonSet(goog.ui.Dialog.ButtonSet.createOk());
    this.diagButtons_ = [];
    this.diagHandlers_ = {};
    this.setDisposeOnHide(true);
    ClosureWidget.Dialog.DO_NOT_SHOW = window['sessionStorage'] ?
        goog.json.parse(window['sessionStorage'].getItem('DONOTSHOW') || '{}') :
        goog.json.parse(goog.net.cookies.get('DONOTSHOW') || '{}');
};
goog.inherits(ClosureWidget.Dialog, goog.ui.Dialog);

/**
 * @param {string} name of button.
 * @param {Function=} opt_fn function to run when button clicked.
 */
ClosureWidget.Dialog.prototype.addButton = function(name, opt_fn) {
    this.diagButtons_.push(name);
    this.diagHandlers_[name] = opt_fn;
};

/**
 * @inheritDoc
 */
ClosureWidget.Dialog.prototype.setVisible = function(bool) {
    if (bool) {
        var bs = new goog.ui.Dialog.ButtonSet();
        var that = this;
        goog.array.forEach(this.diagButtons_, function(name, i) {
            bs.addButton({key: name, caption: name},
                i == 0, !that.diagHandlers_[name]);
        });
        this.setButtonSet(bs);
        this.getHandler().listenOnce(this, goog.ui.Dialog.EventType.SELECT,
                  goog.bind(function(e) {
                      if (this.diagHandlers_[e.key]) {
                          this.diagHandlers_[e.key]();
                      }
                  }, this));
    }
    goog.base(this, 'setVisible', bool);
};

/**
 * @param {string} content for an error box.
 * @param {string=} opt_moreInfo string with more information or null.
 */
ClosureWidget.Dialog.Error = function(content, opt_moreInfo) {
    ClosureWidget.Dialog.create(ClosureWidget.Dialog.Heading.ERROR,
        content, [ClosureWidget.Dialog.Button.OK]);
};

/**
 * @param {string} content for an error box.
 * @param {string=} opt_moreInfo string with more information or null.
 */
ClosureWidget.Dialog.OK = function(content, opt_moreInfo) {
    ClosureWidget.Dialog.create(ClosureWidget.Dialog.Heading.MESSAGE,
        content, [ClosureWidget.Dialog.Button.OK]);
};

/**
 * @param {string} content for an invalid input box.
 * @param {string=} opt_moreInfo string with more information or null.
 */
ClosureWidget.Dialog.InvalidInput = function(content, opt_moreInfo) {
    ClosureWidget.Dialog.create(ClosureWidget.Dialog.Heading.INVALID_INPUT,
        content, [ClosureWidget.Dialog.Button.OK]);
};

/**
 * @param {string} title of dialog.
 * @param {string} content of dialog.
 * @param {Array.<string>} buttons names of buttons.
 * @param {Object=} opt_handlers map on button names to functions.
 * @param {string=} opt_doNotShow id, if it has been set by the user then the
 * default button function will be run.
 * @param {string=} opt_moreInfo string with more information or null.
 */
ClosureWidget.Dialog.create = function(title, content, buttons, opt_handlers, opt_doNotShow, opt_moreInfo) {
    var dialog = new ClosureWidget.Dialog();
    if (ClosureWidget.Dialog.DO_NOT_SHOW[opt_doNotShow]) {
        if (opt_handlers[buttons[0]])
            opt_handlers[buttons[0]]();
        return;
    }
    dialog.setTitle(title);
    if (opt_moreInfo) {
        content += "<div class='" + goog.getCssName('moreinfo') + "'><div class='" + goog.getCssName('moreinfo-header') + "'>" + ClosureWidget.template.Dialog.moreInformation(null, null) + "</div><div class='" + goog.getCssName('moreinfo-content') + "'>" + opt_moreInfo + '</div></div>';
    }
    if (opt_doNotShow) {
        content += '<br><br><form><input type="checkbox" class="' + goog.getCssName('dialog-checkbox') + '" value="' + opt_doNotShow + '" id="do_not_show"/><label for="do_not_show"></label> <small>' + ClosureWidget.template.Dialog.doNotShow(null, null) + '</small></form>';
    }
    dialog.setContent(content);
    if (opt_moreInfo) {
        var moreInfo = new goog.ui.Zippy(goog.dom.getElementByClass(goog.getCssName('moreinfo-header'), dialog.getContentElement()), goog.dom.getElementByClass(goog.getCssName('moreinfo-content'), dialog.getContentElement()));
    }
    dialog.diagButtons_ = buttons || [];
    dialog.diagHandlers_ = opt_handlers || {};
    dialog.setVisible(true);
    if (opt_doNotShow) {
        dialog.getHandler().listen(goog.dom.getElementByClass(goog.getCssName('dialog-checkbox'), dialog.getElement()),
            goog.events.EventType.CLICK, function(e) {
                ClosureWidget.Dialog.DO_NOT_SHOW[opt_doNotShow] = e.target.checked;
                if(window['sessionStorage'])
                    window['sessionStorage'].setItem('DONOTSHOW',
                        goog.json.serialize(ClosureWidget.Dialog.DO_NOT_SHOW));
                else
                    goog.net.cookies.set('DONOTSHOW',
                        goog.json.serialize(ClosureWidget.Dialog.DO_NOT_SHOW),
                        2592000);
            });
    }
};




/** @enum {string}*/
ClosureWidget.Dialog.Heading = {
    ALERT: ClosureWidget.template.Dialog.alert(null, null),
    ERROR: ClosureWidget.template.Dialog.error(null, null),
    INVALID_INPUT: ClosureWidget.template.Dialog.invalidInput(null, null),
    MESSAGE: ClosureWidget.template.Dialog.message(null, null),
    CONFIRM: ClosureWidget.template.Dialog.confirm(null, null)
};

/** @enum {string}*/
ClosureWidget.Dialog.Button = {
    OK: ClosureWidget.template.Dialog.ok(null, null),
    CANCEL: ClosureWidget.template.Dialog.cancel(null, null),
    LEARN_MORE: ClosureWidget.template.Dialog.learnMore(null, null),
    UPGRADE: ClosureWidget.template.Dialog.upgrade(null, null),
    NOT_NOW: ClosureWidget.template.Dialog.notNow(null, null),
    DELETE: ClosureWidget.template.Dialog.deleteButton(null, null),
    DONT_DELETE: ClosureWidget.template.Dialog.dontDelete(null, null),
    REFRESH: ClosureWidget.template.Dialog.refresh(null, null),
    CONTINUE: ClosureWidget.template.Dialog.cont(null, null),
    REMOVE: ClosureWidget.template.Dialog.remove(null, null),
    DONT_REMOVE: ClosureWidget.template.Dialog.dontRemove(null, null),
    LEAVE: ClosureWidget.template.Dialog.leave(null, null),
    DONE: ClosureWidget.template.Dialog.done(null, null)
};

ClosureWidget.Dialog.DO_NOT_SHOW = {};

