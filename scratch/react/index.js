// File made for developing purpose

const { Component, useState, useEffect } = React;
const { create, use, get } = msms;

create('COUNTER', {
  culo: {
    default: 0,
    action: (state, event) => state.culo + event,
    effect: (state, send) => send('count', 1)
  },
  count: {
    default: 0,
    validate: (count) => count > -1,
    action: (state, event) => state.count + event,
  },

  EFFECTS: {
    setCulo: (state, send) => {
      console.log('setCulo pipeline');
    },
  }
});

const C2 = () => {
  const [, state, on] = use('COUNTER', [
    'culo',
  ]);
  const [, update] = useState();

  on(update);

  return (<h1>{state.culo}</h1>)
}

const C1 = ({ id }) => {
  const [send, state, on] = use('COUNTER');
  const [, trigger] = useState();

  on(trigger);

  if (state.count > 10) {
    send('EFFECTS', 'setCulo');
  }


  return (
    <div>
      {state.count}
      {[1, -1].map((event, i) => (
        <button
          key={i}
          type="button"
          onClick={() => send('count', event)}
        >
          {event === 1 ? '+' : '-'}
        </button>
      ))}
    </div>
  );
}

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }
  render() {
    return (
      <div className="App">
        {/* {Array(10).fill(0).map((_, i) => <C1 id={i} />)} */}
        <C2 />
        <C1 />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
