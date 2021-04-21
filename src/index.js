(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["./client"], function(CoCreateStripe) {
        	return factory(CoCreateStripe)
        });
    } else if (typeof module === 'object' && module.exports) {
      const CoCreateStripe = require("./server.js")
      module.exports = factory(CoCreateStripe);
    } else {
        root.returnExports = factory(root["./client.js"]);
  }
}(typeof self !== 'undefined' ? self : this, function (CoCreateStripe) {
  return CoCreateStripe;
}));