"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findChildInChildrenByKey = findChildInChildrenByKey;
exports.mergeChildren = mergeChildren;
exports.toArrayChildren = toArrayChildren;
exports.transformArguments = transformArguments;
exports.windowIsUndefined = void 0;
var _react = _interopRequireDefault(require("react"));
var windowIsUndefined = exports.windowIsUndefined = !(typeof window !== 'undefined' && window.document && window.document.createElement);
function toArrayChildren(children) {
  var ret = [];
  _react.default.Children.forEach(children, function (c) {
    ret.push(c);
  });
  return ret;
}
function findChildInChildrenByKey(children, key) {
  var ret = null;
  if (children) {
    children.forEach(function (c) {
      if (ret || !c) {
        return;
      }
      if (c.key === key) {
        ret = c;
      }
    });
  }
  return ret;
}
function mergeChildren(prev, next) {
  var ret = [];
  // For each key of `next`, the list of keys to insert before that key in
  // the combined list
  var nextChildrenPending = {};
  var pendingChildren = [];
  var followChildrenKey;
  prev.forEach(function (c) {
    if (!c) {
      return;
    }
    if (findChildInChildrenByKey(next, c.key)) {
      if (pendingChildren.length) {
        nextChildrenPending[c.key] = pendingChildren;
        pendingChildren = [];
      }
      followChildrenKey = c.key;
    } else if (c.key) {
      pendingChildren.push(c);
    }
  });
  if (!followChildrenKey) {
    ret = ret.concat(pendingChildren);
  }
  next.forEach(function (c) {
    if (!c) {
      return;
    }
    if (nextChildrenPending.hasOwnProperty(c.key)) {
      ret = ret.concat(nextChildrenPending[c.key]);
    }
    ret.push(c);
    if (c.key === followChildrenKey) {
      ret = ret.concat(pendingChildren);
    }
  });
  return ret;
}
function transformArguments(arg, key, i) {
  var result;
  if (typeof arg === 'function') {
    result = arg({
      key: key,
      index: i
    });
  } else {
    result = arg;
  }
  if (Array.isArray(result)) {
    if (result.length === 2) {
      return result;
    }
    return [result[0], result[0]];
  }
  return [result, result];
}