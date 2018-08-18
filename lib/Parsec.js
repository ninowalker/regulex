"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Parser = function () {
  function Parser(f) {
    (0, _classCallCheck3.default)(this, Parser);

    this.run = f;
  }

  (0, _createClass3.default)(Parser, [{
    key: "thenF",
    value: function thenF(f) {
      var _this = this;

      return new Parser(function (s, i) {
        var a = _this.run(s, i);
        if (a.success) {
          return f(a.result).run(s, a.position);
        } else {
          return a;
        }
      });
    }
  }, {
    key: "then",
    value: function then(p) {
      return this.thenF(function () {
        return p;
      });
    }
  }, {
    key: "map",
    value: function map(f) {
      var _this2 = this;

      return new Parser(function (s, i) {
        var a = _this2.run(s, i);
        if (a.success) {
          return { success: true, position: a.position, result: f(a.result) };
        } else {
          return a;
        }
      });
    }
  }, {
    key: "many",
    value: function many() {
      var _this3 = this;

      return new Parser(function (s, pos) {
        var a,
            i = pos,
            results = [];
        while (true) {
          a = _this3.run(s, i);
          if (a.success) {
            results.push(a.result);

            if (false && a.position === i) {
              throw new Error("Parsec many on nullable parser!");
            }

            i = a.position;
          } else {
            break;
          }
        }
        return { success: true, position: i, result: results };
      });
    }
  }]);
  return Parser;
}();

function alt() {
  for (var _len = arguments.length, parsers = Array(_len), _key = 0; _key < _len; _key++) {
    parsers[_key] = arguments[_key];
  }

  return new Parser(function (s, pos) {
    var a,
        i = 0;
    do {
      var p = parsers[i];
      a = p.run(s, pos);
      if (a.success || a.position != pos) return a;
    } while (++i < parsers.length);
    return a;
  });
}

function exacts(s) {
  return new Parser(function (input, i) {
    var l = s.length;
    if (input.substr(i, l) === s) {
      return { success: true, position: i + l, result: s };
    } else {
      return { success: false, position: i, error: { errorPos: i, errorMsg: "Expect " + JSON.stringify(s) } };
    }
  });
}