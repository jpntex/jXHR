## backbone.sync for jXHR.js


## How To Use
1. Copy `jXHR.js`, `q.js` and `backbone.sync.js` to your `app/lib/` folder.

2. In your `alloy.js` file add the following lines:

  ```
  // Promisses Library
  var Q = require('q');
  
  // AJAX Library
  var $$ = require('jXHR');
  
  // Backbone.Sync override
  require('backbone.sync');
  ```
  
3. Using it:
  ```
  var User = Backbone.Model.extend({
  	parse: function(resp) {
  		return resp.data;
  	}
  });
  
  var user = new User();
  user.url = 'http://httpbin.org/get';
  
  user.fetch().then(function(result) {
   	Ti.API.info(result);
  });
  
  // or
  
  user.fetch({
  	success: function(result) {
  		Ti.API.info(result);
  	}
  });
    ```
