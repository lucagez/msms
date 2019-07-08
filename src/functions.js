import errors from './errors';
import proxy from './proxy';

const _send = (store) => {
  const proxied = proxy(store.state);

  return (prop, arg) => {
    const current = store.schema[prop];

    errors.prop(current, prop);

    const { validate, action, effect } = current;

    const state = action(proxied, arg);

    if (validate && !validate(state)) return false;
    if (store.state[prop] === state) return false;
    if (effect) effect(proxied, store.send);

    store.state[prop] = state;

    // Using slower forEach because of transpilation problems.
    // However, you cannot load so much elements in a webpage to
    // outgrow it's speed.

    // => as the dispatch is O(n)
    store.funcs.forEach((list, func) => {
      if (list.has(prop)) {
        func(proxied);
      }
    });

    return true;
  };
};


const _on = (store, props) => (func) => {
  if (store.funcs.has(func)) return;

  store.funcs.set(func, new Set(props || store.props));
};


const _off = store => (func) => {
  store.funcs.delete(func);
};

export {
  _send,
  _on,
  _off,
};
