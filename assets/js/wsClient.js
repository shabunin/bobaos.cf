var BobaosWsClient = function(parameters, callback) {
  self.url = parameters.url;
  self.callback = callback;

  // store requests and callbacks
  var _reqs = [];

  self.connect = function(cb) {
    _reqs = [];
    self.socket = new WebSocket(self.url);
    if (typeof cb === "function") {
      self.socket.onopen = cb;
    }
    self.socket.onmessage = function(msg) {
      // parse message and then callback
      try {
        var data = JSON.parse(msg.data);
        if (Object.prototype.hasOwnProperty.call(data, "method")) {
          // parse message: response/bcast
          var method = data.method;
          var payload = data.payload;
          // if the message is response to sent request
          if (Object.prototype.hasOwnProperty.call(data, "response_id")) {
            var response_id = data.response_id;
            // find origin request and callback
            var findByResponseId = t => t.request_id === response_id;
            var requestIndex = _reqs.findIndex(findByResponseId);
            if (requestIndex > -1) {
              // get request and remove from store
              var request = _reqs.splice(requestIndex, 1)[0];
              if (method === "success") {
                request.callback(null, payload);
              } else if (method === "error") {
                request.callback(new Error(payload));
              }
            } else {
              CF.log("Can't find request by response_id" + response_id);
            }
          } else {
            // "datapoint value"/"server item" broadcast
            self.callback(method, payload);
          }
        } else {
          CF.log("Unknown data");
          CF.log(msg);
        }
      } catch (e) {
        CF.log("Error on processing incoming message");
        CF.log(msg);
        CF.log(e);
      }
    };
    self.socket.onclose = function() {
      // process close here
      CF.log("Connection closed. You may try to reconnect.");
    };
    self.socket.onerror = function(err) {
      // process error here
      CF.log("Connection error occured.");
      CF.log(JSON.stringify(err));
    };
  };
  
  self.closeConnection = function() {
    return self.socket.close();
  };

  self.sendObject = function(data) {
    console.log("Send object", data);
    return self.socket.send(JSON.stringify(data));
  };

  self.sendCommonRequest = function(method, payload, cb) {
    // compose request and push to _reqs array
    // var request: to push to _reqs array
    var request = {};
    request.callback = cb;

    // message to send
    var message = {};
    var request_id = Math.floor(Math.random() * 0xff);
    request.request_id = request_id;
    message["request_id"] = request_id;
    message["method"] = method;
    message["payload"] = payload;

    // push to store
    _reqs.push(request);

    // send message object
    return self.sendObject(message);
  };

  // common reqs
  self.ping = function(cb) {
    return self.sendCommonRequest("ping", null, cb);
  };
  self.getSdkState = function(cb) {
    return self.sendCommonRequest("get sdk state", null, cb);
  };
  self.reset = function(cb) {
    return self.sendCommonRequest("reset", null, cb);
  };

  // datapoint requests
  self.getDescription = function(id, cb) {
    return self.sendCommonRequest("get description", id, cb);
  };
  self.getValue = function(id, cb) {
    return self.sendCommonRequest("get value", id, cb);
  };
  self.getStoredValue = function(id, cb) {
    return self.sendCommonRequest("get stored value", id, cb);
  };
  self.readValue = function(id, cb) {
    return self.sendCommonRequest("read value", id, cb);
  };
  self.setValue = function(value, cb) {
    return self.sendCommonRequest("set value", value, cb);
  };

  // server items, parameter bytes
  self.getServerItem = function(item, cb) {
    return self.sendCommonRequest("get server item", item, cb);
  };
  self.setProgrammingMode = function(value, cb) {
    return self.sendCommonRequest("set programming mode", value, cb);
  };
  self.getProgrammingMode = function(cb) {
    return self.sendCommonRequest("get programming mode", null, cb);
  };
  self.getParameterByte = function(id, cb) {
    return self.sendCommonRequest("get parameter byte", id, cb);
  };

  return self;
};
