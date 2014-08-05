# jXHR.JS [![Appcelerator Titanium](http://www-static.appcelerator.com/badges/titanium-git-badge-sq.png)](http://appcelerator.com/titanium/) [![Appcelerator Alloy](http://www-static.appcelerator.com/badges/alloy-git-badge-sq.png)](http://appcelerator.com/alloy/)

## Description
jQuery's `$.ajax` method with deferreds for Titanium Alloy

## How To Use
1. Copy both `jXHR.js` and `q.js` to your `app/lib/` folder.

2. In your `index.js` add the following lines:

  ```javascript
  // Promisses Library
  var Q = require('q');
  
  // AJAX Library
  var $$ = require('jXHR');
  ```

3. Then just call it, like this:
  ```javascript
  $$.get('http://www.jpntex.com').then(function(e) {
		Ti.API.debug(e);
	}).fail(function(e) {
		Ti.API.debug(e);
	});
  ```

  or like this:
  
  ```javascript
  $$.ajax({
    url: 'http://www.jpntex.com',
    type: 'GET',
    success: function(e) {Ti.API.debug(e);},
    error: function(e) {Ti.API.debug(e);},
    complete: function(e) {Ti.API.debug(e);},
    async: true,
    timeout: 10000,
    parse: true
  });
  ```

## Backbone.sync
If you would like to use `sync` method from Backbone.js with jXHR.js in Titanium Alloy see `backbone.sync/backbone.sync.js`

## License
```
Copyright (c) João Teixeira

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
