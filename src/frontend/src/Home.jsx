import React from 'react';
import PropTypes from 'prop-types';
import MetaTags from 'react-meta-tags';
import { Link } from "react-router-dom";

import storage from './storage.js';
import { getTagUrl } from './urls.js';
import ExplainerList from './ExplainerList.jsx';
import TagsList from './TagsList.jsx';

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
        const idToTag = {};
        const allTags = this.state.explainers
                            .map(explainer => explainer.tags);
        /* uniquify */
        for (const tags of allTags)
            for (const tag of tags)
                idToTag[tag.id] = tag;
        /* and collect into an array */
        const uniqueTags = [];
        for (const [tagId, tag] of Object.entries(idToTag))
            uniqueTags.push(tag);

        return (
            <div>
              <div className="mb-4">
                <h5>Browse tags</h5>
                <TagsList tags={uniqueTags} />
              </div>
              <h5>Browse all questions</h5>
              <ExplainerList explainers={this.state.explainers} />
            </div>
        );
    }
}

export default Home;
