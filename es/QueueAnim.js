import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["component", "componentProps", "interval", "duration", "delay", "type", "animConfig", "ease", "leaveReverse", "forcedReplay", "animatingClassName", "onEnd", "appear"];
import { useRef, useMemo, useLayoutEffect, useEffect, useState, createElement, cloneElement, forwardRef } from 'react';
// import { findDOMNode } from 'react-dom';
import TweenOne, { Ticker } from 'tween-one';
import { toArrayChildren, findChildInChildrenByKey, windowIsUndefined, mergeChildren, transformArguments } from './utils';
import AnimTypes from './animTypes';
var noop = function noop() {};
export default /*#__PURE__*/forwardRef(function (props, ref) {
  var _props$component = props.component,
    component = _props$component === void 0 ? 'div' : _props$component,
    _props$componentProps = props.componentProps,
    componentProps = _props$componentProps === void 0 ? {} : _props$componentProps,
    _props$interval = props.interval,
    interval = _props$interval === void 0 ? 100 : _props$interval,
    _props$duration = props.duration,
    duration = _props$duration === void 0 ? 450 : _props$duration,
    _props$delay = props.delay,
    delay = _props$delay === void 0 ? 0 : _props$delay,
    _props$type = props.type,
    type = _props$type === void 0 ? 'right' : _props$type,
    _props$animConfig = props.animConfig,
    animConfig = _props$animConfig === void 0 ? null : _props$animConfig,
    _props$ease = props.ease,
    ease = _props$ease === void 0 ? 'easeOutQuart' : _props$ease,
    _props$leaveReverse = props.leaveReverse,
    leaveReverse = _props$leaveReverse === void 0 ? false : _props$leaveReverse,
    _props$forcedReplay = props.forcedReplay,
    forcedReplay = _props$forcedReplay === void 0 ? false : _props$forcedReplay,
    _props$animatingClass = props.animatingClassName,
    animatingClassName = _props$animatingClass === void 0 ? ['queue-anim-entering', 'queue-anim-leaving'] : _props$animatingClass,
    _props$onEnd = props.onEnd,
    onEnd = _props$onEnd === void 0 ? noop : _props$onEnd,
    _props$appear = props.appear,
    appear = _props$appear === void 0 ? true : _props$appear,
    tagProps = _objectWithoutProperties(props, _excluded);
  /**
   * @param childrenShow;
   * 记录 animation 里是否需要 startAnim;
   * 当前元素是否处在显示状态
   * enterBegin 到 leaveComplete 之前都处于显示状态
   */
  var childrenShow = useRef({});
  /**
   * @param keysToEnter;
   * 记录进场的 key;
   */
  var keysToEnter = useRef([]);
  var recordKeysToEnter = useRef([]);
  /**
   * @param keysToLeave;
   * 记录出场的 key;
   */
  var keysToLeave = useRef([]);
  var recordKeysToLeave = useRef([]);
  /**
   * @param placeholderTimeoutIds;
   * 进场时 deley 的 timeout 记录;
   */
  var placeholderTimeoutIds = useRef({});
  /**
   * @param childRefs;
   * 储存 children 的 ref;
   */
  var childRefs = useRef({});
  /**
   * @param recordAnimKeys;
   * 记录启动动画 key
   */
  var recordAnimKeys = useRef({});
  /**
   * @param recordAnimKeys;
   * 记录启动动画 key
   */
  var recordTweenKeys = useRef({});
  /**
   * @param oneEnterBool
   * 记录第一次进入
   */
  var oneEnterBool = useRef(false);
  var originalChildren = useRef([]);
  var _useState = useState(),
    _useState2 = _slicedToArray(_useState, 2),
    child = _useState2[0],
    setChild = _useState2[1];
  var _useState3 = useState({}),
    _useState4 = _slicedToArray(_useState3, 2),
    childShow = _useState4[0],
    setChildShow = _useState4[1];
  var getTweenSingleConfig = function getTweenSingleConfig(data, num, enterOrLeave) {
    var obj = {};
    Object.keys(data).forEach(function (key) {
      if (Array.isArray(data[key])) {
        obj[key] = data[key][num];
      } else if (!enterOrLeave && !num || enterOrLeave && num) {
        obj[key] = data[key];
      }
    });
    return obj;
  };
  var getTweenAnimConfig = function getTweenAnimConfig(data, num, enterOrLeave) {
    if (Array.isArray(data)) {
      return data.map(function (item) {
        return getTweenSingleConfig(item, num, enterOrLeave);
      });
    }
    return getTweenSingleConfig(data, num, enterOrLeave);
  };
  var getTweenType = function getTweenType($type, num) {
    var data = AnimTypes[$type];
    return getTweenAnimConfig(data, num);
  };
  var getAnimData = function getAnimData(key, i, enterOrLeave, startOrEnd) {
    return (
      /**
       * transformArguments 第一个为 enter, 第二个为 leave；
       * getTweenAnimConfig or getTweenType 第一个为到达的位置， 第二个为开始的位置。
       * 用 tween-one 的数组来实现老的动画逻辑。。。
       */
      animConfig ? getTweenAnimConfig(transformArguments(animConfig, key, i)[enterOrLeave], startOrEnd, enterOrLeave) : getTweenType(transformArguments(type, key, i)[enterOrLeave], startOrEnd)
    );
  };
  var getTweenData = function getTweenData(key, i, $type) {
    var enterOrLeave = $type === 'enter' ? 0 : 1;
    var start = $type === 'enter' ? 1 : 0;
    var end = $type === 'enter' ? 0 : 1;
    var animate = getAnimData(key, i, enterOrLeave, end);
    var startAnim = $type === 'enter' && (forcedReplay || !childrenShow.current[key]) ? getAnimData(key, i, enterOrLeave, start) : null;
    var $ease = transformArguments(ease, key, i)[enterOrLeave];
    var $duration = transformArguments(duration, key, i)[enterOrLeave];
    if (Array.isArray(ease) && (ease.length > 2 || Array.isArray(ease[0]))) {
      $ease = $ease.map(function (num) {
        return num * 100;
      });
      $ease = "M0,100C".concat($ease[0], ",").concat(100 - $ease[1], ",").concat($ease[2], ",").concat(100 - $ease[3], ",100,0");
    }
    return {
      startAnim: startAnim,
      animate: animate,
      ease: $ease,
      duration: $duration
    };
  };
  var enterBegin = function enterBegin(key, e) {
    var elem = e.targets;
    elem.className = elem.className.replace(animatingClassName[1], '');
    if (elem.className.indexOf(animatingClassName[0]) === -1) {
      elem.className = "".concat(elem.className, " ").concat(animatingClassName[0]).trim();
    }
    if (keysToEnter.current.indexOf(key) >= 0) {
      keysToEnter.current.splice(keysToEnter.current.indexOf(key), 1);
    }
    childrenShow.current[key] = true;
  };
  var enterComplete = function enterComplete(key, e) {
    if (keysToLeave.current.indexOf(key) >= 0) {
      return;
    }
    var elem = e.targets;
    elem.className = elem.className.replace(animatingClassName[0], '').trim();
    delete recordTweenKeys.current[key];
    onEnd({
      key: key,
      type: 'enter',
      target: elem
    });
  };
  var leaveBegin = function leaveBegin(key, e) {
    var elem = e.targets;
    elem.className = elem.className.replace(animatingClassName[0], '');
    if (elem.className.indexOf(animatingClassName[1]) === -1) {
      elem.className = "".concat(elem.className, " ").concat(animatingClassName[1]).trim();
    }
  };
  var leaveComplete = function leaveComplete(key, e) {
    // 切换时同时触发 onComplete。 手动跳出。。。
    toArrayChildren(props.children).findIndex(function (c) {
      return c && c.key === key;
    });
    if (toArrayChildren(props.children).findIndex(function (c) {
      return c && c.key === key;
    }) >= 0) {
      return;
    }
    delete childrenShow.current[key];
    delete recordTweenKeys.current[key];
    originalChildren.current = originalChildren.current.filter(function (c) {
      return c.key !== key;
    });
    // 这里不用启动动画，，直接删；
    if (keysToLeave.current.indexOf(key) >= 0) {
      keysToLeave.current.splice(keysToLeave.current.indexOf(key), 1);
    }
    var needLeave = keysToLeave.current.some(function (c) {
      return childShow[c];
    });
    if (!needLeave) {
      var currentChildren = toArrayChildren(props.children);
      setChild(currentChildren);
      setChildShow(_objectSpread({}, childrenShow.current));
      recordKeysToLeave.current.forEach(function (k) {
        delete recordAnimKeys.current[k];
      });
    }
    var elem = e.targets;
    elem.className = elem.className.replace(animatingClassName[1], '').trim();
    onEnd({
      key: key,
      type: 'leave',
      target: elem
    });
  };
  var performEnterBegin = function performEnterBegin(key) {
    childShow[key] = true;
    Ticker.clear(placeholderTimeoutIds.current[key]);
    delete placeholderTimeoutIds.current[key];
    setChildShow(_objectSpread({}, childShow));
  };
  var performEnter = function performEnter(key, i) {
    var $interval = transformArguments(interval, key, i)[0];
    var $delay = transformArguments(delay, key, i)[0];
    placeholderTimeoutIds.current[key] = Ticker.timeout(function () {
      performEnterBegin(key);
    }, $interval * i + $delay);
  };
  var performLeave = function performLeave(key) {
    Ticker.clear(placeholderTimeoutIds.current[key]);
    delete placeholderTimeoutIds.current[key];
  };
  var getTweenOneEnterOrLeave = function getTweenOneEnterOrLeave(key, i, $delay, $type) {
    var animateData = getTweenData(key, i, $type);
    var onStart = function onStart(e) {
      ($type === 'enter' ? enterBegin : leaveBegin)(key, e);
    };
    var onComplete = function onComplete(e) {
      ($type === 'enter' ? enterComplete : leaveComplete)(key, e);
    };
    if (Array.isArray(animateData.animate)) {
      var length = animateData.animate.length - 1;
      var animation = animateData.animate.map(function (item, ii) {
        return _objectSpread(_objectSpread({}, item), {}, {
          startAt: animateData.startAnim ? animateData.startAnim[ii] : undefined,
          duration: animateData.duration / length,
          delay: !ii && $type === 'leave' ? $delay : 0,
          onStart: !ii ? onStart : undefined,
          onComplete: ii === length ? onComplete : undefined
        });
      });
      return animation;
    }
    return _objectSpread(_objectSpread({}, animateData.animate), {}, {
      startAt: animateData.startAnim || undefined,
      ease: animateData.ease,
      duration: animateData.duration,
      onStart: onStart,
      onComplete: onComplete,
      delay: $delay
    });
  };
  useEffect(function () {
    return function () {
      Object.keys(recordTweenKeys.current).forEach(function (key) {
        var tween = recordTweenKeys.current[key];
        if (!tween) {
          return;
        }
        tween.kill();
      });
    };
  }, []);
  useEffect(function () {
    var nextChildren = toArrayChildren(props.children).filter(function (c) {
      return c;
    });
    var currentChildren = originalChildren.current.filter(function (item) {
      return item;
    });
    var newChildren = mergeChildren(currentChildren, nextChildren);
    var $keysToEnter = [];
    var $keysToLeave = [];
    if (!appear && !oneEnterBool.current) {
      var $childShow = {};
      newChildren.forEach(function (c) {
        if (!c || !c.key) {
          return;
        }
        $childShow[c.key] = true;
      });
      originalChildren.current = newChildren;
      childrenShow.current = _objectSpread({}, $childShow);
      setChildShow($childShow);
    } else {
      // console.log(nextChildren, recordAnimKeys.current, keysToEnter.current, keysToLeave.current);
      currentChildren.forEach(function (c) {
        if (!c) {
          return;
        }
        var key = c.key;
        var hasNext = findChildInChildrenByKey(nextChildren, key);
        if (!hasNext && key) {
          $keysToLeave.push(key);
          Ticker.clear(placeholderTimeoutIds.current[key]);
          delete placeholderTimeoutIds.current[key];
        }
      });
      nextChildren.forEach(function (c) {
        if (!c) {
          return;
        }
        var key = c.key;
        var hasPrev = findChildInChildrenByKey(currentChildren, key);
        // 如果 nextChildren 和当前的一致，且动画里是出场，改回进场；
        if (!hasPrev && key || (!recordAnimKeys.current[key] || recordAnimKeys.current[key] === 'leave' || keysToEnter.current.indexOf(key) >= 0) && $keysToLeave.indexOf(key) === -1) {
          $keysToEnter.push(key);
        }
      });
    }
    // console.log('child update', $keysToEnter, $keysToLeave, newChildren);
    keysToEnter.current = $keysToEnter;
    // keysToEnter 在启动时就会删除；
    recordKeysToEnter.current = [].concat($keysToEnter);
    keysToLeave.current = $keysToLeave;
    recordKeysToLeave.current = [].concat($keysToLeave);
    // console.log($keysToEnter, $keysToLeave);
    setChild(newChildren);
  }, [props.children]);
  useLayoutEffect(function () {
    originalChildren.current = child || [];
    if (appear || oneEnterBool.current) {
      var $keysToEnter = _toConsumableArray(keysToEnter.current);
      var $keysToLeave = _toConsumableArray(keysToLeave.current);
      $keysToEnter.forEach(performEnter);
      $keysToLeave.forEach(performLeave);
    }
    if (child) {
      oneEnterBool.current = true;
    }
  }, [child]);
  useLayoutEffect(function () {
    if (child) {
      child.forEach(function (item) {
        var key = item.key;
        var dom = childRefs.current[key];
        if (!dom) {
          return;
        }
        var animation;
        var index = keysToLeave.current.indexOf(key); // children.findIndex(c => c.key === key);
        var $interval = transformArguments(interval, key, index);
        var $delay = transformArguments(delay, key, index);
        // 处理出场
        if (index >= 0) {
          if (recordAnimKeys.current[key] === 'leave') {
            return;
          }
          var order = leaveReverse ? keysToLeave.current.length - index - 1 : index;
          var d = $interval[1] * order + $delay[1];
          animation = getTweenOneEnterOrLeave(key, index, d, 'leave');
          recordAnimKeys.current[key] = 'leave';
        } else {
          if (recordAnimKeys.current[key] === 'enter' || keysToEnter.current.indexOf(key) === -1) {
            return;
          }
          index = recordKeysToEnter.current.indexOf(key);
          var _d = $interval[0] * index + $delay[0];
          // console.log(recordAnimKeys.current[key], dom);
          animation = getTweenOneEnterOrLeave(key, index, recordAnimKeys.current[key] === 'leave' ? _d : 0, 'enter');
          recordAnimKeys.current[key] = 'enter';
        }
        if (recordTweenKeys.current[key]) {
          recordTweenKeys.current[key].kill();
        }
        if (forcedReplay) {
          var anim = _objectSpread(_objectSpread({}, Array.isArray(animation) ? animation[0].startAt : animation.startAt), {}, {
            type: 'set'
          });
          TweenOne(dom, {
            animation: anim
          });
        }
        recordTweenKeys.current[key] = TweenOne(dom, {
          animation: animation
        });
      });
    }
  }, [childShow, child]);
  return useMemo(function () {
    // console.log('--------render--------', childShow);
    if (windowIsUndefined) {
      return /*#__PURE__*/createElement(component, _objectSpread(_objectSpread(_objectSpread({}, tagProps), componentProps), {}, {
        ref: ref
      }));
    }
    var childrenToRender = toArrayChildren(child).map(function (item) {
      if (!item || !item.key) {
        return item;
      }
      return childShow[item.key] && /*#__PURE__*/cloneElement(item, {
        ref: function ref(c) {
          childRefs.current[item.key] = c; // instanceof Element ? c : findDOMNode(c);
          if (!c) {
            delete childRefs.current[item.key];
          }
        },
        key: item.key
      });
    });
    var p = _objectSpread(_objectSpread(_objectSpread({}, tagProps), componentProps), {}, {
      ref: ref
    });
    return /*#__PURE__*/createElement(component, p, childrenToRender);
  }, [childShow, child]);
});