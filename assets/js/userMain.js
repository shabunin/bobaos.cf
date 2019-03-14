var bobaos;
var bobaosParams = { url: "ws://10.0.42.33:49190" };

// example function that toggles datapoint dpt1 value
var toggleDatapoint = function(id, cb) {
  // get value at first
  bobaos.getValue(id, function(err, data) {
    if (err) {
      if (typeof cb === "function") {
        return cb(err);
      } else {
        CF.log("error setting datapoint value: " + id);
        return CF.log(err.message);
      }
    }
    var value = data.value;
    // then send inverted
    bobaos.setValue({ id: id, value: !value }, function(err, res) {
      if (err) {
        if (typeof cb === "function") {
          return cb(err);
        } else {
          CF.log("error setting datapoint value: " + id);
          return CF.log(err.message);
        }
      }

      // finally, if callback has been defined, call it
      if (typeof cb === "function") {
        return cb(null, res);
      }
    });
  });
};

// example function that increases dpt5/dpt9 value by 1.
// it uses the same pattern as a previous:
// first, get value, then calculate and set new value
var increaseSetpointBy = function(id, increment, cb) {
  bobaos.getValue(id, function(err, data) {
    if (err) {
      if (typeof cb === "function") {
        return cb(err);
      } else {
        CF.log("error setting datapoint value: " + id);
        return CF.log(err.message);
      }
    }

    var value = data.value;
    var newValue = value + increment;
    // then send inverted
    bobaos.setValue({ id: id, value: newValue }, function(err, res) {
      if (err) {
        if (typeof cb === "function") {
          return cb(err);
        } else {
          CF.log("error setting datapoint value: " + id);
          return CF.log(err.message);
        }
      }

      // finally, if callback has been defined, call it
      if (typeof cb === "function") {
        return cb(null, res);
      }
    });
  });
};

var increaseSetpointBy1 = function(id, cb) {
  // call previous function with increment = 1 and pass callback if it has been defined
  return increaseSetpointBy(id, 1, cb);
};

var decreaseSetpointBy1 = function(id, cb) {
  return increaseSetpointBy(id, -1, cb);
};

// finally, direct value
var sendDirectValue = function(id, value, cb) {
  // send value
  bobaos.setValue({ id: id, value: value }, function(err, res) {
    if (err) {
      if (typeof cb === "function") {
        return cb(err);
      } else {
        CF.log("error setting datapoint value: " + id);
        return CF.log(err.message);
      }
    }

    // finally, if callback has been defined, call it
    if (typeof cb === "function") {
      return cb(null, res);
    }
  });
};

// function to process incoming datapoint value from KNX bus
// e.g. when temperature changes or button is pressed
// make sure to have "Update" flag checked in datapoint properties in ETS
var processOneValue = function(payload) {
  var id = payload.id;
  var value = payload.value;
  switch (id) {
    // current temperature
    case 1:
      CF.setJoin("s1", value);
      break;
    // datapoint 6 in my case is a status object for datapoint 2 control
    case 6:
      CF.setJoin("d2", value);
      break;
    case 10:
      CF.setJoin("d10", value);
      break;
    case 11:
      var sliderVal = Math.round((65535 * value) / 255);
      CF.setJoin("a11", sliderVal);
    default:
      break;
  }
};

// script can receive on or more datapoint values
// so, in general callback function check if it is Array and process each datapoint separately
// if not, then assuming it is object, process only this one value
var bobaosCallback = function(method, payload) {
  CF.log("incoming data: " + method + "::" + JSON.stringify(payload));
  if (Array.isArray(payload)) {
    return payload.forEach(processOneValue);
  }

  processOneValue(payload);
};

// on startup init client instance
CF.userMain = function() {
  CF.log("starting bobaos.cf");
  bobaos = BobaosWsClient(bobaosParams, bobaosCallback);
  bobaos.connect(function (event) {
    // send read request for desired datapoints
    bobaos.readValue([1, 2, 3], function(err, res) {
      if (err) {
        return CF.log("error while reading values: " + err.message);
      }
      CF.log("read request has been sent");
    });
  });
    // if iPad goes to sleep, close connection
  CF.watch(CF.GUISuspendedEvent, function() {
    CF.log("GUI suspended, closing bobaos ws");
    bobaos.closeConnection();
  });
  
  // if it wakes up, reconnect
  CF.watch(CF.GUIResumedEvent, function() {
    CF.log("GUI resumed, opening ws again");
    
    // call method to be sure connection is closed
    bobaos.closeConnection();
    // connect again
    bobaos.connect(function (event) {
      // send read request for desired datapoints
      bobaos.readValue([1, 2, 3], function(err, res) {
        if (err) {
          return CF.log("error while reading values: " + err.message);
        }
        CF.log("read request has been sent");
      });
    });
  });
  
  // register listeners for gui joins
  // first, for analog slider to send 0-255 value on bus
  CF.watch(CF.ObjectReleasedEvent, "a11", function(join, value, tokens) {
    var convertedValue = Math.floor((value * 255) / 65535);
    sendDirectValue(11, convertedValue, function(err, res) {
      if (err) {
        return CF.log("error on setting slider value 11: " + err.message);
      }

      CF.log("set slider value 11: success");
    });
  });
  
  // now, for join 2
  CF.watch(CF.ObjectPressedEvent, "d2", function(join, value, tokens) {
    toggleDatapoint(2, function(err, res) {
      if (err) {
        return CF.log("error on sending datapoint 2 value: " + err.message);
      }

      CF.log("toggle datapoint 2 value: success");
    });
  });
};
