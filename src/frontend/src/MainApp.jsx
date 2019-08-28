import React from 'react';
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";
import Autosuggest from 'react-autosuggest';

import SiteHeader from './SiteHeader.jsx';
import Home from './Home.jsx';
import Explainer from './Explainer.jsx';
import AddExplainer from './AddExplainer.jsx';
import ManageApprovals from './ManageApprovals.jsx';
import storage from './storage.js';
import { getExplainerUrl } from './urls.js';

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

const WeirdUrl = () => {
    return <h5>You appear to be lost, wandering in the wilderness. Go <a href="/">home</a>?</h5>;
};

class SiteSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            suggestions: [],
            value: '',
        };

        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onSuggestionSelected = this.onSuggestionSelected.bind(this);
    }

    onSuggestionsFetchRequested({ value }) {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        if (inputLength === 0)
            return [];

        const suggestions = this.props.explainers.filter(
            explainer => explainer.question.toLowerCase().indexOf(inputValue) !== -1
        );

        this.setState({suggestions});
    }

    onSuggestionsClearRequested() {
        this.setState({suggestions: []});
    }

    onSearchChange(event, { newValue }) {
        this.setState({value: newValue});
    }

    onSuggestionSelected(event, { suggestion }) {
        this.props.history.push(getExplainerUrl(suggestion));
        this.setState({value: ''});
    }

    render() {
        const { value, suggestions } = this.state;

        const inputProps = {
            value,
            placeholder: "Ask Yang a question",
            onChange: this.onSearchChange,
        };

        return <Autosuggest
                   suggestions={suggestions}
                   onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                   onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                   onSuggestionSelected={this.onSuggestionSelected}
                   getSuggestionValue={explainer => explainer.question}
                   renderSuggestion={explainer => <div>{explainer.question}</div> }
                   inputProps={inputProps}
        />;
    }
}

const SiteSearchWithRouter = withRouter(SiteSearch);

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => {
        if (YangConfig.user)
            return <Component {...props} />;
        window.location.replace("/login");
        return null;
    }} />
);

class MainApp extends React.Component {
    constructor(props) {
        super(props);

        /* TODO: might actually be nice to have Redux in here :thinking: */
        this.state = {
            explainers: [],
            suggestions: [],
        };
    }

    async componentDidMount() {
        const explainers = (await storage.getAllExplainers()).questions;
        this.setState({explainers});
    }

    render() {
        return (
            <div>
              <Router>
                <SiteHeader />
                <div className="row">
                  <div className="col-md-6 offset-md-3">
                    <div className="row">
                      <div className="col-lg-3 d-flex justify-content-center">
                        <Link className="btn btn-outline-info btn-sm d-lg-none mb-3" to="/a/add">Add Question</Link>
                      </div>
                      <div className="col-lg-6 d-flex justify-content-center">
                        <SiteSearchWithRouter explainers={this.state.explainers} />
                      </div>
                      <div className="col-lg-3 d-none d-lg-flex justify-content-center">
                        <Link className="btn btn-outline-info" to="/a/add">Add Question</Link>
                      </div>
                    </div>
                    <hr />
                    <Switch>
                      <Route exact path="/" component={Home} />
                      <Route exact path="/q/:id" component={ExplainerById} />
                      <Route exact path="/q/:id/:slug" component={ExplainerById} />
                      <PrivateRoute exact path="/a/add" component={AddExplainer} />
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
