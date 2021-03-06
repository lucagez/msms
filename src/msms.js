import prepareSchema from './prepareSchema';
import errors from './errors';
import proxy from './proxy';
import stores from './stores';
import {
  _send,
  _on,
  _off,
} from './functions';

const create = (name, schema) => {
  const { state, props, usedSchema } = prepareSchema(schema);

  const store = {
    state,
    props,
    schema: usedSchema,
    queue: [],
    funcs: new Map(),
  };

  store.send = _send(store);

  stores.set(name, store);
};

const get = (name) => {
  const store = stores.get(name);

  errors.store(store, name);

  return proxy(store.state);
};

const use = (name, alloweds) => {
  const store = stores.get(name);

  errors.store(store, name);
  errors.alloweds(store, alloweds);

  return [
    _send(store),
    proxy(store.state),
    _on(store, alloweds),
    _off(store),
  ];
};

const destroy = name => stores.delete(name);

export {
  create,
  use,
  get,
  destroy,
};
