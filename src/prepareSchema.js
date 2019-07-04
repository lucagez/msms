const prepareSchema = (schema) => {
  const state = {};
  const usedSchema = {};

  for (const prop in schema) {
    const current = schema[prop];
    if (typeof current === 'object') {
      state[prop] = typeof current.default !== 'undefined'
        ? current.default
        : current.action({});

      usedSchema[prop] = current;
    } else {
      state[prop] = current({});
      usedSchema[prop] = { action: current };
    }
  }

  return {
    state,
    usedSchema,
    props: Object.keys(state),
  };
};

export default prepareSchema;
