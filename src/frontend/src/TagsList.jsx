import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import { tagShape } from './shapes.js';
import urls from './urls.js';

class TagsList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showAll: false,
        };

        this.onExpandoClick = this.onExpandoClick.bind(this);
    }

    onExpandoClick(e) {
        e.preventDefault();
        this.setState({showAll: true});
    }

    render() {
        const { maxTags, tags, subdued } = this.props;

        const classes = subdued
                      ? "badge badge-pill badge-light"
                      : "badge badge-pill badge-info";

        let displayTags, showExpando;
        if (this.state.showAll || maxTags >= tags.length) {
            displayTags = tags;
            showExpando = false;
        } else {
            displayTags = tags.slice(0, maxTags);
            showExpando = true;
        }

        return (
            <span>
              {displayTags.map(tag => (
                  <Link key={tag.id}
                        to={urls.pretty.tag(tag)}
                        style={{margin: "0 2px"}}
                        className={classes}>{tag.text}</Link>
              ))}
              {showExpando &&
               <a href="#"
                  onClick={this.onExpandoClick}
                  className="ml-1 text-muted">
                 <small>{subdued ? '...' : 'More'}</small>
               </a>
              }
            </span>
        );
    }
}

TagsList.propTypes = {
    tags: PropTypes.arrayOf(tagShape).isRequired,
    subdued: PropTypes.bool,
    maxTags: PropTypes.number,
};

TagsList.defaultProps = {
    subdued: false,
    maxTags: 10,
};

export default TagsList;
