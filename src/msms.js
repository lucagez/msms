import prepareSchema from './prepareSchema';
import errors from './errors';
import stores from './stores';
import {
  _send,
  _on,
  _off,
  _copy,
} from './functions';

const create = (name, schema) => {
  const { state, props, usedSchema } = prepareSchema(schema);

  const store = {
    state,
    props,
    schema: usedSchema,
    queue: [],
    list: new Set(),
  };

  stores.set(name, store);
};

const get = (name) => {
  const store = stores.get(name);

  errors.store(store, name);

  return store.state;
};

const use = (name, alloweds) => {
  const store = stores.get(name);

  errors.store(store, name);
  errors.alloweds(store, alloweds);

  const usedProps = alloweds || store.props;

  const { copy, copyFunc } = _copy(usedProps, store.state);

  return [
    _send(store),
    _on(store, usedProps, copyFunc),
    _off(store),
    copy,
  ];
};

const destroy = name => stores.delete(name);

export {
  create,
  use,
  get,
  destroy,
};
