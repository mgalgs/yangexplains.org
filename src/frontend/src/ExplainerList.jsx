import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import { explainerShape } from './shapes.js';
import ExplainerTags from './ExplainerTags.jsx';

const Views = ({ explainer }) => {
    return (
        <span className="badge badge-light mx-2">
          <i className="far fa-eye"></i> {explainer.views}
        </span>
    );
};

class ExplainerList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <ul className="list-unstyled">
              {this.props.explainers.map(explainer => (
                  <li key={explainer.id}>
                    <Views explainer={explainer} />
                    <Link to={explainer.prettyUrl}>{explainer.question}</Link>
                    <ExplainerTags explainer={explainer}
                                   subdued={true}
                                   maxTags={5}
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
