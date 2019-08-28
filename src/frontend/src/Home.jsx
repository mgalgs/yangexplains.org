import React from 'react';
import PropTypes from 'prop-types';
import MetaTags from 'react-meta-tags';

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
              <MetaTags>
                <title>Yang Explains</title>
                <meta name="description" content="Andrew Yang 2020" />
                <meta property="og:title" content="Yang Explains!" />
                <meta property="og:image" content={YangConfig.logo} />
              </MetaTags>
              <h5>Browse all questions</h5>
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
