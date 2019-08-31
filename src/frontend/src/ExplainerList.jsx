import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import { explainerShape } from './shapes.js';
import ExplainerTags from './ExplainerTags.jsx';

class ExplainerList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ul>
              {this.props.explainers.map(explainer => (
                  <li key={explainer.id}>
                    <Link to={explainer.prettyUrl}>{explainer.question}</Link>
                    <ExplainerTags explainer={explainer}
                                   style={{marginLeft: "10px",
                                           position: "relative",
                                           bottom: "1px"}}
                    />
                  </li>
              ))}
            </ul>
        );
    }
}

ExplainerList.propTypes = {
    explainers: PropTypes.arrayOf(explainerShape),
};

export default ExplainerList;
