// Empty set property.
// => The resulting object will be a read only
// copy.
// => Way fater than freezing.
const proxy = obj => new Proxy(obj, {
  set() { },
});

export default proxy;
