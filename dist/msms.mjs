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

var template = function (params) { return ("\n(function ({" + params + "}) {\n  return {" + params + "};\n})\n"); };

var cp = function (arr) {
  var params = [];

  for (var i = 0; i < arr.length; i++) {
    params.push(arr[i]);
  }

  var strParams = params.join(',');
  return eval(template(strParams));
};

var _copy = function (props, state) {
  var copyFunc = cp(props);
  return {
    copyFunc: copyFunc,
    copy: function () { return copyFunc(state); }
  };
};

var _send = function (store) { return function (prop, arg) {
  var ref = store.queue;
  var length = ref.length;
  var current = store.schema[prop];
  errors.prop(current, prop);
  var validate = current.validate;
  var action = current.action;
  var state = action(store.state, arg);
  if (validate && !validate(state)) { return false; }
  if (store.state[prop] === state) { return false; }
  store.state[prop] = state; // Dispatching in O(n) time 😍

  for (var i = 0; i < length; i++) {
    var ref$1 = store.queue[i];
    var list = ref$1.list;
    var copy = ref$1.copy;
    var func = ref$1.func;

    if (list.has(prop)) {
      func(copy(store.state));
    }
  }

  return true;
}; };

var _on = function (store, props, copy) { return function (func) {
  if (store.list.has(func)) { return; }
  store.queue.push({
    func: func,
    list: new Set(props),
    copy: copy
  });
}; };

var _off = function (store) { return function (func) {
  store.list.delete(func);
  store.queue = store.queue.filter(function (ref) {
    var current = ref.func;

    return func !== current;
  });
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
    list: new Set()
  };
  stores.set(name, store);
};

var get = function (name) {
  var store = stores.get(name);
  errors.store(store, name);
  return store.state;
};

var use = function (name, alloweds) {
  var store = stores.get(name);
  errors.store(store, name);
  errors.alloweds(store, alloweds);
  var usedProps = alloweds || store.props;

  var ref = _copy(usedProps, store.state);
  var copy = ref.copy;
  var copyFunc = ref.copyFunc;

  return [_send(store), _on(store, usedProps, copyFunc), _off(store), copy];
};

var destroy = function (name) { return stores.delete(name); };

export { create, use, get, destroy };
//# sourceMappingURL=msms.mjs.map
