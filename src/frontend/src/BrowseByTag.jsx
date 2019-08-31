import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import storage from './storage.js';
import ExplainerList from './ExplainerList.jsx';

class BrowseByTag extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            filteredExplainers: [],
        };
    }

    async componentDidMount() {
        const explainers = await storage.getAllExplainers();
        this.setState({
            filteredExplainers: explainers.filter(explainer => {
                return explainer.tags
                                .map(tag => tag.text)
                                .indexOf(this.props.match.params.tagtext) !== -1;
            }),
        });
    }

    render() {
        return (
            <div>
              <Link to="/">Back</Link>
              <h5>Browse questions tagged with {this.props.match.params.tagtext}</h5>
              <ExplainerList explainers={this.state.filteredExplainers} />
            </div>
        );
    }
}

BrowseByTag.propTypes = {
    match: PropTypes.object.isRequired,
};

export default BrowseByTag;
