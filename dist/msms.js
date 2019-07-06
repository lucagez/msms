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

var stores = new Map();

// => The resulting object will be a read only
// copy.
// => Way fater than freezing.

var makeProxy = function (obj) { return new Proxy(obj, {
  set: function set() {}

}); };

var _send = function (store) {
  var proxied = makeProxy(store.state);
  return function (prop, arg) {
    var ref = store.queue;
    var length = ref.length;
    var current = store.schema[prop];
    errors.prop(current, prop);
    var validate = current.validate;
    var action = current.action;
    var state = action(proxied, arg);
    if (validate && !validate(state)) { return false; }
    if (store.state[prop] === state) { return false; }
    store.state[prop] = state; // Dispatching in O(n) time 😍

    for (var i = 0; i < length; i++) {
      var ref$1 = store.queue[i];
      var list = ref$1.list;
      var func = ref$1.func;

      if (list.has(prop)) {
        func(proxied);
      }
    }

    return true;
  };
};

var _on = function (store, props) { return function (func) {
  if (store.funcs.has(func)) { return; }
  store.queue.push({
    func: func,
    list: new Set(props || store.props)
  });
}; };

var _off = function (store) { return function (func) {
  store.funcs.delete(func);
  store.queue = store.queue.filter(function (ref) {
    var current = ref.func;

    return func !== current;
  });
}; };

var makeProxy$1 = function (obj) { return new Proxy(obj, {
  set: function set() {}

}); };

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
    funcs: new Set()
  };
  state.send = _send(store);
  stores.set(name, store);
};

var get = function (name) {
  var store = stores.get(name);
  errors.store(store, name);
  return makeProxy$1(store.state);
};

var use = function (name, alloweds) {
  var store = stores.get(name);
  errors.store(store, name);
  errors.alloweds(store, alloweds);
  return [_send(store), _on(store, alloweds), _off(store), makeProxy$1(store.state)];
};

var destroy = function (name) { return stores.delete(name); };

exports.create = create;
exports.use = use;
exports.get = get;
exports.destroy = destroy;
//# sourceMappingURL=msms.js.map
