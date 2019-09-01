import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import { tagShape } from './shapes.js';
import urls from './urls.js';

class TagsList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const classes = this.props.subdued
                      ? "badge badge-pill badge-light"
                      : "badge badge-pill badge-info";
        return (
            <span>
              {this.props.tags.map(tag => (
                  <Link key={tag.id}
                        to={urls.pretty.tag(tag)}
                        style={{margin: "0 2px"}}
                        className={classes}>{tag.text}</Link>
              ))}
            </span>
        );
    }
}

TagsList.propTypes = {
    tags: PropTypes.arrayOf(tagShape).isRequired,
    subdued: PropTypes.bool,
};

TagsList.defaultProps = {
    subdued: false,
};

export default TagsList;
