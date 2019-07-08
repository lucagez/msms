const errors = {
  prop: (obj, prop) => {
    if (typeof obj[prop] === 'undefined' && prop !== 'EFFECTS') {
      throw new Error(`${prop} is not a prop`);
    }
  },

  store: (obj, name) => {
    if (typeof obj === 'undefined') {
      throw new Error(`${name} is not a store`);
    }
  },

  alloweds: (obj, alloweds) => {
    if (alloweds) {
      alloweds
        .forEach((allowed) => {
          if (typeof obj.schema[allowed] === 'undefined') {
            throw new Error(`${allowed} is not a prop`);
          }
        });
    }
  },
};

export default errors;
