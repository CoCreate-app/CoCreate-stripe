(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["./client"], function(CoCreateFacebook) {
        	return factory(CoCreateFacebook)
        });
    } else if (typeof module === 'object' && module.exports) {
      const CoCreateFacebook = require("./server.js")
      module.exports = factory(CoCreateFacebook);
    } else {
        root.returnExports = factory(root["./client.js"]);
  }
}(typeof self !== 'undefined' ? self : this, function (CoCreateFacebook) {
  return CoCreateFacebook;
}));