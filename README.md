# Closure Widgets #

reusable UI components for use with Closure-Library.

I use the G-Closure interface for a couple of components, you can get it here:

https://github.com/rhysbrettbowen/G-closure

most of these will inherit from goog.ui.Component

## Formalize v0.1 ##

include it in the file with:

```javascript
goog.require('ClosureWidget.Formalize');
```

also make sure you're using the G-Closure interface by having the file somewhere in your project directory (I recommend having a /lib folder with all these in)

then create the form as usual in HTML and pass the for element in to decorate:

```javascript
var formEl = goog.dom.getElementsByTagNameAndClass('form')[0];
var myForm = new ClosureWidget.Formalize();
myForm.decorate(formEl);
```

Formalize will emulate placeholders in IE by placing a label over the input with the same text as it's placeholder attribute

Make sure you pass in a function to run on submit, give it a function to handle errors and pass in validation rules:

```javascript
myForm.submitFunction(function(event) {
  /*
   * submit code goes here
   * no need to prevent default or return false
   */
});
myForm.addValidation('name', function(name) {
  if(name.length > 64)
    throw new Error('name is too long');
});
myForm.addValidation('age', function(age) {
  if(!goog.isNumber(age))
    throw new Error('age must be a number');
});
myForm.handleError(function(message) {
  alert(message);
});
```

This is a rough first draft so let me know if you want to see any features

### TODO: ###

- some default validation functions provided
- more flexible placeholder positioning
- pass in the element to handle Error
- can provide extra class or class prefix to be applied to elements

## Simple Editor v0.1 ##

include it in the file with:

```javascript
goog.require('ClosureWidget.SimpleEditor');
```

The editor will automagically change it's height to be in line with the text entered and also gives the option of autosaving.

to instantiate you need to pass the constructor an object with options (if you wish to change the defaults):

 - text : intial text default to blank string
 - autosaveTime : time with no activity until save default to 3000
 - autosave : false if you wish to stop autosaving default to true
 - cssPrefix : string to prefix class with default none
 - textPadding : extra white space under text default 30(px)

you can listen for events like ClosureWidget.SimpleEditor.EventType.SAVING and run your save function, then just call it's saved function when you are done which will fire the SAVED event. Also the SAVE event will let you know when you can save changes, you can call save() and pass in a function that should get the text to save it (don't forget to call .saved() when done).

## Image Gallery v0.1 ##

include it in the file with:

```javascript
goog.require('ClosureWidget.ImageGallery');
```

also make sure you're using the G-Closure interface by having the file somewhere in your project directory (I recommend having a /lib folder with all these in)

Create an Image Gallery like so:

```javascript
var imageGallery = new ClosureWidget.ImageGallery();
var images = [
{
  medium: "URL/TO/MEDIUM.png",
  small: "URL/TO/SMALL.png"
},
{
  medium: "URL/TO/MEDIUM2.png",
  small: "URL/TO/SMALL2.png"  
}
];
imageGallery.addImages(images);
imageGallery.createDom();
imageGallery.render(ELEMENT);
imageGallery.showImages();
```

you can also clear the gallery and reset with:

```javascript
imageGallery.images = [];
imageGallery.addImages(moreImages);
imageGallery.showImages();
```

gallery will show medium images at 600x400 with small images at 32x32

### TODO ###

- make sizes more flexible
- add in controls overlaying medium image

