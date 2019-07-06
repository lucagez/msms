import errors from './errors';

// Empty set property.
// => The resulting object will be a read only
// copy.
// => Way fater than freezing.
const makeProxy = obj => new Proxy(obj, {
  set() { },
});

const _send = (store) => {
  const proxied = makeProxy(store.state);

  return (prop, arg) => {
    const { length } = store.queue;
    const current = store.schema[prop];

    errors.prop(current, prop);

    const { validate, action } = current;

    const state = action(proxied, arg);

    if (validate && !validate(state)) return false;
    if (store.state[prop] === state) return false;

    store.state[prop] = state;

    // Dispatching in O(n) time 😍
    for (let i = 0; i < length; i++) {
      const { list, func } = store.queue[i];

      if (list.has(prop)) {
        func(proxied);
      }
    }

    return true;
  };
};


const _on = (store, props) => (func) => {
  if (store.funcs.has(func)) return;

  store.queue.push({
    func,
    list: new Set(props || store.props),
  });
};


const _off = store => (func) => {
  store.funcs.delete(func);
  store.queue = store.queue
    .filter(({ func: current }) => func !== current);
};

export {
  _send,
  _on,
  _off,
};
