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
        return (
            <span>
              {this.props.tags.map(tag => (
                  <Link key={tag.id}
                        to={urls.pretty.tag(tag)}
                        style={{margin: "0 2px"}}
                        className="badge badge-pill badge-info">{tag.text}</Link>
              ))}
            </span>
        );
    }
}

TagsList.propTypes = {
    tags: PropTypes.arrayOf(tagShape).isRequired,
};

export default TagsList;
