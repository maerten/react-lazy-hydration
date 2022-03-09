import _extends from '@babel/runtime/helpers/esm/extends';
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose';
import * as React from 'react';

var _excluded = ["noWrapper", "ssrOnly", "whenIdle", "whenVisible", "promise", "on", "children", "didHydrate", "as"];
// React currently throws a warning when using useLayoutEffect on the server.
var useIsomorphicLayoutEffect = React.useLayoutEffect ;

function reducer() {
  return true;
}

function LazyHydrate(props) {
  var childRef = React.useRef(null); // Always render on server

  var _React$useReducer = React.useReducer(reducer, !(true )),
      hydrated = _React$useReducer[0],
      hydrate = _React$useReducer[1];

  var noWrapper = props.noWrapper,
      ssrOnly = props.ssrOnly,
      whenIdle = props.whenIdle,
      whenVisible = props.whenVisible,
      promise = props.promise,
      _props$on = props.on,
      on = _props$on === void 0 ? [] : _props$on,
      children = props.children,
      didHydrate = props.didHydrate,
      _props$as = props.as,
      as = _props$as === void 0 ? 'div' : _props$as,
      rest = _objectWithoutPropertiesLoose(props, _excluded);

  if ('production' !== process.env.NODE_ENV && !ssrOnly && !whenIdle && !whenVisible && !on.length && !promise) {
    console.error("LazyHydration: Enable atleast one trigger for hydration.\n" + "If you don't want to hydrate, use ssrOnly");
  }

  useIsomorphicLayoutEffect(function () {
    // No SSR Content
    if (!childRef.current.hasChildNodes()) {
      hydrate();
    }
  }, []);
  React.useEffect(function () {
    if (hydrated && didHydrate) {
      didHydrate();
    } // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [hydrated]);
  React.useEffect(function () {
    if (ssrOnly || hydrated) return;
    var rootElement = childRef.current;
    var cleanupFns = [];

    function cleanup() {
      cleanupFns.forEach(function (fn) {
        fn();
      });
    }

    if (promise) {
      promise.then(hydrate, hydrate);
    }

    if (whenVisible) {
      var element = noWrapper ? rootElement : // As root node does not have any box model, it cannot intersect.
      rootElement.firstElementChild;

      if (element && typeof IntersectionObserver !== "undefined") {
        var observerOptions = typeof whenVisible === "object" ? whenVisible : {
          rootMargin: "250px"
        };
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              hydrate();
            }
          });
        }, observerOptions);
        io.observe(element);
        cleanupFns.push(function () {
          io.disconnect();
        });
      } else {
        return hydrate();
      }
    }

    if (whenIdle) {
      // @ts-ignore
      if (typeof requestIdleCallback !== "undefined") {
        // @ts-ignore
        var idleCallbackId = requestIdleCallback(hydrate, {
          timeout: 500
        });
        cleanupFns.push(function () {
          // @ts-ignore
          cancelIdleCallback(idleCallbackId);
        });
      } else {
        var id = setTimeout(hydrate, 2000);
        cleanupFns.push(function () {
          clearTimeout(id);
        });
      }
    }

    var events = [].concat(on);
    events.forEach(function (event) {
      rootElement.addEventListener(event, hydrate, {
        once: true,
        passive: true
      });
      cleanupFns.push(function () {
        rootElement.removeEventListener(event, hydrate, {});
      });
    });
    return cleanup;
  }, [hydrated, on, ssrOnly, whenIdle, whenVisible, didHydrate, promise, noWrapper]);
  var WrapperElement = typeof noWrapper === "string" ? noWrapper : as;

  if (hydrated) {
    if (noWrapper) {
      return children;
    }

    return /*#__PURE__*/React.createElement(WrapperElement, _extends({
      ref: childRef
    }, rest), children);
  } else {
    return /*#__PURE__*/React.createElement(WrapperElement, _extends({}, rest, {
      ref: childRef,
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: {
        __html: ""
      }
    }));
  }
}

export { LazyHydrate as default };
