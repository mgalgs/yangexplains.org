import React from 'react';
import Explainer from './Explainer.jsx';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import storage from './storage.js';

const ExplainerById = ({ match }) => {
    const id = parseInt(match.params.id);
    return (
        <div>
          <Link to="/">Back</Link>
          <Explainer key={id} id={id} />
          <hr />
        </div>
    );
};

class MainApp extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="row">
              <div className="col-md-8 offset-md-2">
                <h1 className="text-center">Yang Explains!</h1>
                <Router>
                  <div>
                    <Route path="/q/:id" component={ExplainerById} />
                  </div>

                  <ul>
                    {storage.getAllExplainers().map(e => (
                        <li key={e.id}>
                          <Link to={`/q/${e.id}`}>{e.question}</Link>
                        </li>
                    ))}
                  </ul>
                </Router>
              </div>
            </div>
        );
    }
}

export default MainApp;
