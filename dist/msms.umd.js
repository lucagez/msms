(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.msms = {})));
}(this, (function (exports) {
  var prepareSchema = function (schema) {
    var state = {};
    var usedSchema = {};

    for (var prop in schema) {
      var current = schema[prop];

      if (typeof current === 'object') {
        state[prop] = typeof current.default !== 'undefined' ? current.default : current.action({});
        usedSchema[prop] = current;
      } else {
        state[prop] = current({});
        usedSchema[prop] = {
          action: current
        };
      }
    }

    return {
      state: state,
      usedSchema: usedSchema,
      props: Object.keys(state)
    };
  };

  var errors = {
    prop: function (obj, prop) {
      if (typeof obj === 'undefined') {
        throw new Error((prop + " is not a prop"));
      }
    },
    store: function (obj, name) {
      if (typeof obj === 'undefined') {
        throw new Error((name + " is not a store"));
      }
    },
    alloweds: function (obj, alloweds) {
      if (alloweds) {
        alloweds.forEach(function (allowed) {
          if (typeof obj.schema[allowed] === 'undefined') {
            throw new Error((allowed + " is not a prop"));
          }
        });
      }
    }
  };

  /**
   * `proxy` will create a new dynamic proxy that
   * will make read-only ANY object passed into it.
   * => Every state callback will always return a proxy.
   * This will result in making the state only internally
   * mutable via previously defined `send` actions.
   *
   * NOTE: The proxy is create only one time at store creation
   * and the same instance of the proxy will be used for
   * interactions with the external API.
   * This approach will be way faster and will expose way less overhead
   * than creating a new `Object.freeze()` object on each
   * user facing action.
   *
   * @param {object} obj
   * Object taken as reference for creating a new deep Proxy
   *
   * @return {Proxy}
   * User facing proxied state. A read-only reference to the internal state.
   */
  var proxy = function (obj) {
    // Recycling proxies.
    // Using a WeakMap to allow proxies to be garbage collected.
    var proxies = new WeakMap();
    var descriptor = {
      get: function get(target, prop) {
        var value = target[prop];
        var tempProxy = proxies.get(value);

        if (typeof value === 'object' && !tempProxy) {
          tempProxy = new Proxy(value, descriptor);
          proxies.set(value, tempProxy);
        }

        return tempProxy || value;
      },

      // Empty set property.
      // => The resulting object will be a read only
      // copy.
      // => Way faster than freezing.
      set: function set() {}

    };
    return new Proxy(obj, descriptor);
  };

  var stores = new Map();

  var _send = function (store) {
    var proxied = proxy(store.state);
    return function (prop, arg) {
      var current = store.schema[prop];
      errors.prop(current, prop);
      var validate = current.validate;
      var action = current.action;
      var state = action(proxied, arg);
      if (validate && !validate(state)) { return false; }
      if (store.state[prop] === state) { return false; }
      store.state[prop] = state; // Using slower forEach because of transpilation problems.
      // However, you cannot load so much elements in a webpage to
      // outgrow it's speed.
      // => as the dispatch is O(n)

      store.funcs.forEach(function (list, func) {
        if (list.has(prop)) {
          func(proxied);
        }
      });
      return true;
    };
  };

  var _on = function (store, props) { return function (func) {
    if (store.funcs.has(func)) { return; }
    store.funcs.set(func, new Set(props || store.props));
  }; };

  var _off = function (store) { return function (func) {
    store.funcs.delete(func);
  }; };

  var create = function (name, schema) {
    var ref = prepareSchema(schema);
    var state = ref.state;
    var props = ref.props;
    var usedSchema = ref.usedSchema;
    var store = {
      state: state,
      props: props,
      schema: usedSchema,
      queue: [],
      funcs: new Map()
    };
    state.send = _send(store);
    stores.set(name, store);
  };

  var get = function (name) {
    var store = stores.get(name);
    errors.store(store, name);
    return proxy(store.state);
  };

  var use = function (name, alloweds) {
    var store = stores.get(name);
    errors.store(store, name);
    errors.alloweds(store, alloweds);
    return [_send(store), proxy(store.state), _on(store, alloweds), _off(store)];
  };

  var destroy = function (name) { return stores.delete(name); };

  exports.create = create;
  exports.use = use;
  exports.get = get;
  exports.destroy = destroy;

})));
//# sourceMappingURL=msms.umd.js.map
