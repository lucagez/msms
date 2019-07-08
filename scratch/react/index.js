
// File made for developing purpose

const { Component, useState, useEffect } = React;
const { create, use, get } = msms;

create('COUNTER', {
  culo: {
    default: 0,
    action: (state, event) => state.culo + event,
  },
  count: {
    default: 0,
    validate: (count) => count > -1,
    action: (state, event) => state.count + event,
    effect: (state, send) => {
      send('culo', 10);
    },
  },
});

const C1 = ({ id }) => {
  const [send, state, on] = use('COUNTER');
  const [, trigger] = useState();

  on(trigger);

  console.log(state);

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
        <C1 />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
