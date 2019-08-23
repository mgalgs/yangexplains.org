import React from 'react';
import PropTypes from 'prop-types';
import storage from './storage.js';
import { Link } from "react-router-dom";

class Home extends React.Component {
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
            <div>
              <ul>
                {this.state.explainers.map(explainer => (
                    <li key={explainer.id}>
                      <Link to={`/q/${explainer.id}`}>{explainer.question}</Link>
                    </li>
                ))}
              </ul>
            </div>
        );
    }
}

export default Home;
