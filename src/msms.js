import prepareSchema from './prepareSchema';
import errors from './errors';
import stores from './stores';
import {
  _send,
  _on,
  _off,
} from './functions';


const makeProxy = obj => new Proxy(obj, {
  set() { },
});

const create = (name, schema) => {
  const { state, props, usedSchema } = prepareSchema(schema);

  const store = {
    state,
    props,
    schema: usedSchema,
    queue: [],
    funcs: new Map(),
  };

  state.send = _send(store);

  stores.set(name, store);
};

const get = (name) => {
  const store = stores.get(name);

  errors.store(store, name);

  return makeProxy(store.state);
};

const use = (name, alloweds) => {
  const store = stores.get(name);

  errors.store(store, name);
  errors.alloweds(store, alloweds);

  return [
    _send(store),
    _on(store, alloweds),
    _off(store),
    makeProxy(store.state),
  ];
};

const destroy = name => stores.delete(name);

export {
  create,
  use,
  get,
  destroy,
};
