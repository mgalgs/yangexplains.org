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
        <nav className="nav">
          <span className="m-2 navbar-text">{YangConfig.user.email}</span>
          <Link className="m-2 btn btn-primary" to="/a/add">Add <i className="fas fa-plus-square"></i></Link>
          {YangConfig.user.is_approver &&
           <Link className="m-2 btn btn-secondary" to="/a/approvals">Approvals</Link>
          }
          <a className="m-2 btn btn-outline-info" href="/logout">Logout</a>
        </nav>
    );
};

const UserMenuAnon = () => {
    return <a className="btn btn-outline-info" href="/login">Login</a>;
};

const WeirdUrl = () => {
    return <h5>You appear to be lost, wandering in the wilderness. Go <a href="/">home</a>?</h5>;
};

const Nav = () => {
    return (
        <header className="py-3 yang-header mb-5">
          <div className="row flex-nowrap justify-content-between align-items-center">
            <div className="col-4 pt-1"></div>
            <div className="col-4 text-center">
              <Link to="/">
                <img style={{maxWidth: "100px", maxHeight: "100px"}} src="/static/yangexplains_logo.png" />
              </Link>
            </div>
            <div className="col-4 d-flex justify-content-end align-items-center">
              {YangConfig.user ? <UserMenuLoggedIn /> : <UserMenuAnon />}
            </div>
          </div>
        </header>
    );
};

class MainApp extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
              <Router>
                <Nav />
                <div className="row">
                  <div className="col-6 offset-3">
                    <Switch>
                      <Route exact path="/" component={Home} />
                      <Route exact path="/q/:id" component={ExplainerById} />
                      <Route exact path="/a/add" component={AddExplainer} />
                      <Route exact path="/a/approvals" component={ManageApprovals} />
                      <Route component={WeirdUrl} />
                    </Switch>
                  </div>
                </div>
              </Router>
            </div>
        );
    }
}

export default MainApp;
