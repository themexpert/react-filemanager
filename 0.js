webpackJsonp([0],{

/***/ 143:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PluginRegistry = undefined;

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
    }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var PluginRegistry = exports.PluginRegistry = {
    load: function load(name, hook, callback) {
        var _this = this;

        setTimeout(function () {
            return callback(hook, _this.component(name), 10);
        });
    },
    component: function component(name) {
        return function (_Component) {
            _inherits(ProMessage, _Component);

            function ProMessage() {
                var _ref;

                var _temp, _this2, _ret;

                _classCallCheck(this, ProMessage);

                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = ProMessage.__proto__ || Object.getPrototypeOf(ProMessage)).call.apply(_ref, [this].concat(args))), _this2), _this2.render = function () {
                    return name + ": Only available in PRO";
                }, _temp), _possibleConstructorReturn(_this2, _ret);
            }

            return ProMessage;
        }(_react.Component);
    }
};

/***/ })

});