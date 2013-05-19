if(typeof module != 'undefined') {
  var fs = require('fs');
  var IS_NODE = true;
}

var VCRConstructor = function VCR() {
  this.config = {
    hookInto: null,
    host: null,
    cassetteLibraryDir: 'cassettes',
    cassetteIgnoreUrlProtocol : false
  }
};

VCRConstructor.Store = {
  set: function(dir, name, cassette) {
    var data = JSON.stringify(cassette);

    if(IS_NODE) {
      if(!fs.existsSync(dir)) fs.mkdirSync(dir);
      fs.writeFile(dir + '/' + name + ".json", data);
    } else {
      localStorage.setItem(name, data);
    }
  },

  get: function(dir, name) {
    if(IS_NODE) {
      try{
        var data = fs.readFileSync(dir + '/' + name + ".json");
      } catch(e) {
        var data = false;
      }
    } else {
      var data = localStorage.getItem(name);
    }
    return !data ? false : JSON.parse(data);
  }
};

VCRConstructor.trimUrlProtocol = function(url){
  return url.replace( /^http:\/\/|https:\/\/|\/\//, '' );
};

VCRConstructor.getCassetteName = function(type, url){
  return type + ',' + url;
};

VCRConstructor.Context = function VCRContext(name, config) {
  var self = this;

  this.hookInto = config.hookInto;
  this.cassetteLibraryDir = config.cassetteLibraryDir;
  this.name = name;
  this.type = null;
  this.url = null;
  this.requestHeaders = config.requestHeaders;

  this.XMLHttpRequest = function() {
    var XHR = new self.hookInto;

    return self.intercept(XHR, {
      open: function(type, url) {
        self.type = type.toUpperCase();
        self.url = url;
      },

      send: function(data) {
        var response = self.getCassetteFor(self.type, self.url);
        var callback = this.onreadystatechange;
        var fakeXHR = this;

        if(!response) {
          XHR.open(self.type, (config.host || '') + self.url);
          self.setRequestHeaders(XHR, self.requestHeaders);
          XHR.send(data);
          XHR.onreadystatechange = function() {
            if(this.readyState === 4) {
              self.setCassetteFor(self.type, self.url, this)
            }
            self.extend(fakeXHR, this);
            self.invokeCallback(callback, arguments);
          }
        } else {
          self.extend(fakeXHR, {
            responseText: response.data,

            readyState: response.readyState,

            status: response.statusCode,

            getAllResponseHeaders: function() {
              var rawHeaders = "";
              for(var property in response.headers) {
                rawHeaders += property + ": " + response.headers[property] + "\n";
              }
              return rawHeaders;
            }
          });

          self.invokeCallback(callback);
        }
      }
    });
  };

  this.extend = function(destination, source, object) {
    for (var property in source) {
      destination[property] = object ? (object[property] || source[property]) : source[property];
    }
    return destination;
  };

  this.intercept = function(source, object) {
    return self.extend({}, source, object);
  };

  this.getCassetteFor = function(type, url) {
    var cassette = VCRConstructor.Store.get(self.cassetteLibraryDir, self.name);
    self.cassette = cassette ? cassette : {};
    return self.cassette[VCRConstructor.getCassetteName(type, self.getUrlForCassette(url))];
  };

  this.setCassetteFor = function(type, url, response) {
    var rawHeaders = response.getAllResponseHeaders().split("\n");
    var headers = {};
    var cassette;

    for(var i = 0; i < rawHeaders.length; i++) {
      var cleanHeaders = rawHeaders[i].split(":");
      if(cleanHeaders[0]) {
        headers[cleanHeaders[0]] = cleanHeaders[1].replace(/(\r|\n|^\s+)/g, "");
      }
    }

    var flow = {
      statusCode: response.status,
      readyState: response.readyState,
      headers: headers,
      data: response.responseText
    };

    cassette = VCRConstructor.Store.get(self.cassetteLibraryDir, self.name) || {};
    cassette[VCRConstructor.getCassetteName(type, self.getUrlForCassette(url))] = flow;

    VCRConstructor.Store.set(self.cassetteLibraryDir, self.name, cassette);
  };

  this.setRequestHeaders = function(xhr, headers){
    for(var key in headers){
      if(headers.hasOwnProperty(key)){
        xhr.setRequestHeader(key, headers[key]);
      }
    }
  };

  this.invokeCallback = function(callback,args){
    if(typeof callback === 'function'){
      callback.apply(this,args);
    }
  };

  this.getUrlForCassette = function( url ){
    return config.cassetteIgnoreUrlProtocol ? VCRConstructor.trimUrlProtocol(url) : url;
  };
};

VCRConstructor.prototype = {
  constructor: VCRConstructor,

  configure: function(fn) {
    fn(this.config);
  },

  useCassette: function(name, fn) {
    fn(new VCRConstructor.Context(name, this.config));
  },

  addResource: function(type, url, resource, name, directory){
    var cassetteName,
      store,
      ctor = VCRConstructor,
      ignoreProtocol = this.config.cassetteIgnoreUrlProtocol;

    url = ignoreProtocol ? ctor.trimUrlProtocol(url) : url;
    cassetteName = ctor.getCassetteName(type, url);
    store = ctor.Store.get(directory, name) || {};
    store[cassetteName] = resource;
    ctor.Store.set(directory, name, store);
  }
};

if(IS_NODE) {
  module.exports = new VCRConstructor;
} else {
  var VCR = new VCRConstructor;
}
