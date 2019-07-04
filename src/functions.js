import errors from './errors';
import cp from './cp';

const _copy = (props, state) => {
  const copyFunc = cp(props);
  return {
    copyFunc,
    copy: () => copyFunc(state),
  };
};

const _send = store => (prop, arg) => {
  const { length } = store.queue;
  const current = store.schema[prop];

  errors.prop(current, prop);

  const { validate, action } = current;

  const state = action(store.state, arg);

  if (validate && !validate(state)) return false;
  if (store.state[prop] === state) return false;

  store.state[prop] = state;

  // Dispatching in O(n) time 😍
  for (let i = 0; i < length; i++) {
    const { list, copy, func } = store.queue[i];

    if (list.has(prop)) {
      func(copy(store.state));
    }
  }

  return true;
};

const _on = (store, props, copy) => (func) => {
  if (store.list.has(func)) return;

  store.queue.push({
    func,
    list: new Set(props),
    copy,
  });
};

const _off = store => (func) => {
  store.list.delete(func);
  store.queue = store.queue
    .filter(({ func: current }) => func !== current);
};

export {
  _send,
  _on,
  _off,
  _copy,
};
