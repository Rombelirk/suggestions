import React, { useRef, useState } from 'react';
import axios from 'axios'
import './App.css';

function App() {
  const [hits, setHits] = useState(() => [])

  const DEBOUNCE_DELAY = 200;
  const CancelToken = axios.CancelToken;
  const currentRequest = useRef(null);
  const timeout = useRef(null);

  const makeSearchRequest = (searchString) => {
    currentRequest.current = CancelToken.source()
    axios.post('https://latency-dsn.algolia.net/1/indexes/*/queries?x-algolia-api-key=6be0576ff61c053d5f9a3225e2a90f76&x-algolia-application-id=latency',
      {
        "requests": [{ "indexName": "ikea", "params": `query=${searchString}&hitsPerPage=16` }]
      },
      {
        cancelToken: currentRequest.current.token
      }
    ).then(res => { currentRequest.current = null; setHits(res.data.results[0].hits) }).catch((err) => {
      if (axios.isCancel(err)) {
        console.log('Request canceled', err.message);
      } else {
        console.log(err)
      }
    })
  }

  const onInputChange = (e) => {
    const pending = currentRequest.current;
    const value = e.target.value;

    if (pending) {
      pending.cancel('canceled by user');
      currentRequest.current = null;
    }
    makeSearchRequest(value)
  }

  const debounce = (func, delay) => e => {
    const { current } = timeout;
    e.persist()
    if (current) {
      clearTimeout(current);
    }
    timeout.current = setTimeout(() => {
      func(e);
      clearTimeout(current);
    }, delay);
  }

  return (
    <div className="App">
      <div className="container">
        <input className="input" type="text" onChange={debounce(onInputChange, DEBOUNCE_DELAY)} />
        {hits.length > 0 && <div className="suggestions">
          {
            hits.map(hit => {
              return <div key={hit.objectID} className="suggestion"><img className="image" src={hit.image} />{hit.name}</div>
            })
          }
        </div>}
      </div>
    </div>
  );
}

export default App;
