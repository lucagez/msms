!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e(t.msms={})}(this,function(t){var e=function(t,e){if(void 0===t)throw new Error(e+" is not a store")},n=new Map,r=function(t){var e=new Proxy(t.state,{set:function(){}});return function(n,r){var o=t.schema[n];!function(t,e){if(void 0===o)throw new Error(e+" is not a prop")}(0,n);var u=o.validate,f=(0,o.action)(e,r);if(u&&!u(f))return!1;if(t.state[n]===f)return!1;t.state[n]=f;for(var i=0,a=t.funcs;i<a.length;i+=1){var s=a[i],c=s[0];s[1].has(n)&&c(e)}return!0}},o=function(t,e){return function(n){t.funcs.has(n)||t.funcs.set(n,new Set(e||t.props))}},u=function(t){return function(e){t.funcs.delete(e)}},f=function(t){return new Proxy(t,{set:function(){}})};t.create=function(t,e){var o=function(t){var e={},n={};for(var r in t){var o=t[r];"object"==typeof o?(e[r]=void 0!==o.default?o.default:o.action({}),n[r]=o):(e[r]=o({}),n[r]={action:o})}return{state:e,usedSchema:n,props:Object.keys(e)}}(e),u=o.state,f={state:u,props:o.props,schema:o.usedSchema,queue:[],funcs:new Map};u.send=r(f),n.set(t,f)},t.use=function(t,i){var a=n.get(t);return e(a,t),function(t,e){e&&e.forEach(function(e){if(void 0===t.schema[e])throw new Error(e+" is not a prop")})}(a,i),[r(a),o(a,i),u(a),f(a.state)]},t.get=function(t){var r=n.get(t);return e(r,t),f(r.state)},t.destroy=function(t){return n.delete(t)}});
