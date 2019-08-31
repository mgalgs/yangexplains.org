import React from 'react';
import PropTypes from 'prop-types';
import MetaTags from 'react-meta-tags';

import storage from './storage.js';
import ExplainerList from './ExplainerList.jsx';

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            explainers: [],
        };
    }

    async componentDidMount() {
        const explainers = await storage.getAllExplainers();
        this.setState({explainers});
    }

    render() {
        return (
            <div>
              <h5>Browse all questions</h5>
              <ExplainerList explainers={this.state.explainers} />
            </div>
        );
    }
}

export default Home;
