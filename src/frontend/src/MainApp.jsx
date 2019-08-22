import React from 'react';
import Explainer from './Explainer.jsx';
import AddExplainer from './AddExplainer.jsx';
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

const UserMenuLoggedIn = () => {
    return <div>{YangConfig.userEmail} | <a href="/add">Add +</a> | <a href="/logout">Logout</a></div>;
};

const UserMenuAnon = () => {
    return <div><a href="/login">Login</a></div>;
};

class MainApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            explainers: [],
        };
    }

    async componentDidMount() {
        const explainers = (await storage.getAllExplainers()).questions;
        this.setState({explainers});
    }

    render() {
        return (
            <div className="row">
              <div className="col-md-8 offset-md-2">
                <div style={{float: "right"}}>
                  {YangConfig.userId ? <UserMenuLoggedIn /> : <UserMenuAnon />}
                </div>
                <h1 className="text-center">Yang Explains!</h1>
                <Router>
                  <div>
                    <Route path="/q/:id" component={ExplainerById} />
                    <Route path="/add" component={AddExplainer} />
                  </div>

                  <ul>
                    {this.state.explainers.map(e => (
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
