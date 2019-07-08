
// File made for developing purpose

const { Component, useState, useEffect } = React;
const { create, use, get } = msms;

create('COUNTER', {
  culo: {
    default: {
      a: {
        b: 5,
      },
    },
    action: (state, event) => {
      return state.culo + event
    },
  },
  count: {
    default: 0,
    validate: (count) => count > -1,
    action: (state, event) => {
      state.send('culo', 45);
      return state.count + event
    },
  },
});

const C1 = ({ id }) => {
  const [send, state, on] = use('COUNTER');
  const [, trigger] = useState();

  on(trigger);

  console.log(state)

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
        {this.state.count > 5 && <h1>HI! (:</h1>}
        {/* {Array(10).fill(0).map((_, i) => <C1 id={i} />)} */}
        <C1 />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
