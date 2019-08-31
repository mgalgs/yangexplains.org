import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";

import storage from './storage.js';
import { yangPost } from './network.js';
import { explainerShape } from './shapes.js';

class ExplainerTag extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            value: '',
            showAdd: false,
        };

        this.onChange = this.onChange.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
    }

    onChange(e) {
        this.setState({value: event.target.value});
    }

    async onKeyDown(e) {
        if (e.keyCode !== 13)
            return;
        const [explainer, rsp] = await yangPost(this.props.explainer.apiUrl, {
            'action': 'add_tag',
            'text': this.state.value,
        });
        if (!rsp.ok) {
            alert(`Couldn't add tag: ${rsp}`);
            return;
        }
        storage.invalidateCaches();
        storage.augmentExplainer(explainer);
        this.props.onAdd(explainer);
        this.setState({value: ''});
    }

    render() {
        const { explainer } = this.props;
        const { showAdd } = this.state;
        let addStuff = null;
        if (this.props.onAdd && explainer.isApproverOrSubmitter) {
            if (showAdd) {
                addStuff = <input type="text"
                                  className="form-control"
                                  placeholder="Add tag"
                                  value={this.state.value}
                                  onChange={this.onChange}
                                  onKeyDown={this.onKeyDown}
                />;
            } else {
                addStuff = <button className="btn btn-sm btn-outline-primary ml-3"
                                   style={{fontSize: "0.6em"}}
                                   onClick={() => {this.setState({showAdd: true})} }>
                  <i className="fas fa-plus"></i> Add tag
                </button>;
            }
        }
        return (
            <span style={{...this.props.style}}>
              {explainer.tags.map(tag => (
                  <Link key={tag.id}
                        to={`/tag/${tag.text}`}
                        style={{margin: "0 2px"}}
                        className="badge badge-pill badge-info">{tag.text}</Link>
              ))}
              {addStuff}
            </span>
        );
    }
}

ExplainerTag.propTypes = {
    explainer: explainerShape.isRequired,
    onAdd: PropTypes.func,
    style: PropTypes.object,
};

ExplainerTag.defaultProps = {
    style: {},
};

export default ExplainerTag;
