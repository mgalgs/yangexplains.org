import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import { tagShape, explainerShape } from './shapes.js';
import urls from './urls.js';
import { yangPost } from './network.js';
import storage from './storage.js';

class TagsList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            maxTags: props.maxTags,
        };

        this.onExpandoClick = this.onExpandoClick.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ maxTags: nextProps.maxTags });
    }

    onExpandoClick(e) {
        e.preventDefault();
        this.setState(prevState => ({maxTags: prevState.maxTags + 30}));
    }

    async onRemoveClick(tag, e) {
        e.preventDefault();
        const explainer = this.props.boundExplainer;
        const [newExplainer, rsp] = await yangPost(explainer.apiUrl, {
            'action': 'remove_tag',
            'tag_id': tag.id,
        });
        if (rsp.ok && this.props.onRemove)
            this.props.onRemove(storage.augmentExplainer(newExplainer));
    }

    render() {
        const { tags, subdued, boundExplainer } = this.props;
        const { maxTags } = this.state;

        const classes = subdued
                      ? "badge badge-pill badge-light"
                      : "badge badge-pill badge-info";

        let displayTags, showExpando;
        if (maxTags >= tags.length) {
            displayTags = tags;
            showExpando = false;
        } else {
            displayTags = tags.slice(0, maxTags);
            showExpando = true;
        }

        return (
            <span>
              {displayTags.map(tag => (
                  <span key={tag.id}>
                    <Link to={urls.pretty.tag(tag)}
                          style={{margin: "0 2px"}}
                          className={classes}>
                      {tag.text}
                    </Link>
                    {boundExplainer && boundExplainer.isApproverOrSubmitter && !subdued &&
                     <a href="#"
                        onClick={this.onRemoveClick.bind(this, tag)}
                     >&times;</a>
                    }
                  </span>
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
    boundExplainer: explainerShape,
    onRemove: PropTypes.func,
};

TagsList.defaultProps = {
    subdued: false,
    maxTags: 10,
};

export default TagsList;
