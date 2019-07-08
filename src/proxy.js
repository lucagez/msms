/**
 * `proxy` will create a new dynamic proxy that
 * will make read-only ANY object passed into it.
 * => Every state callback will always return a proxy.
 * This will result in making the state only internally
 * mutable via previously defined `send` actions.
 *
 * NOTE: The proxy is create only one time at store creation
 * and the same instance of the proxy will be used for
 * interactions with the external API.
 * This approach will be way faster and will expose way less overhead
 * than creating a new `Object.freeze()` object on each
 * user facing action.
 *
 * @param {object} obj
 * Object taken as reference for creating a new deep Proxy
 *
 * @return {Proxy}
 * User facing proxied state. A read-only reference to the internal state.
 */
const proxy = (obj) => {
  // Recycling proxies.
  // Using a WeakMap to allow proxies to be garbage collected.
  const proxies = new WeakMap();

  const descriptor = {
    get(target, prop) {
      const value = target[prop];
      let tempProxy = proxies.get(value);

      if (typeof value === 'object' && !tempProxy) {
        tempProxy = new Proxy(value, descriptor);
        proxies.set(value, tempProxy);
      }

      return tempProxy || value;
    },
    // Empty set property.
    // => The resulting object will be a read only
    // copy.
    // => Way faster than freezing.
    set() { },
  };

  return new Proxy(obj, descriptor);
};

export default proxy;
