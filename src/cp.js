const template = params => `
(function ({${params}}) {
  return {${params}};
})
`;

const cp = (arr) => {
  const params = [];

  for (let i = 0; i < arr.length; i++) {
    params.push(arr[i]);
  }

  const strParams = params.join(',');

  return eval(template(strParams));
};

export default cp;
