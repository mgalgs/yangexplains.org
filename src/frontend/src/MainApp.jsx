import React from 'react';
import Home from './Home.jsx';
import Explainer from './Explainer.jsx';
import AddExplainer from './AddExplainer.jsx';
import ManageApprovals from './ManageApprovals.jsx';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
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
    return (
        <ul>
          <li>{YangConfig.user.email}</li>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/a/add">Add +</Link></li>
          {YangConfig.user.is_approver &&
           <li><Link to="/a/approvals">Approvals</Link></li>
          }
          <li><a href="/logout">Logout</a></li>
        </ul>
    );
};

const UserMenuAnon = () => {
    return <div><a href="/login">Login</a></div>;
};

const WeirdUrl = () => {
    return <h5>You appear to be lost, wandering in the wilderness. Go <a href="/">home</a>?</h5>;
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
                  <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/q/:id" component={ExplainerById} />
                    <Route exact path="/a/add" component={AddExplainer} />
                    <Route exact path="/a/approvals" component={ManageApprovals} />
                    <Route component={WeirdUrl} />
                  </Switch>

                  <div style={{float: "right"}}>
                    {YangConfig.user ? <UserMenuLoggedIn /> : <UserMenuAnon />}
                  </div>
                </Router>
              </div>
            </div>
        );
    }
}

export default MainApp;
