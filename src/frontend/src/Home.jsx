import React from 'react';
import PropTypes from 'prop-types';
import MetaTags from 'react-meta-tags';
import { Link } from "react-router-dom";

import storage from './storage.js';
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
                            .map(({tags, views}) => ({tags, views}));
        /* uniquify */
        for (const tagInfo of allTags) {
            for (const tag of tagInfo.tags) {
                if (!idToTag.hasOwnProperty(tag.id))
                    idToTag[tag.id] = {tag, views: 0};
                idToTag[tag.id].views += tagInfo.views;
            }
        }
        /* and collect into an array */
        const uniqueTags = [];
        for (const [tagId, tagInfo] of Object.entries(idToTag))
            uniqueTags.push({tag: tagInfo.tag, views: tagInfo.views});
        const uniqueTagsSorted = uniqueTags.sort((a, b) => b.views - a.views)
                                           .map(({ tag }) => tag);

        return (
            <div>
              <div className="mb-4">
                <h5>Browse tags</h5>
                <TagsList tags={uniqueTagsSorted} />
              </div>
              <h5>Browse all questions</h5>
              <ExplainerList explainers={this.state.explainers} />
            </div>
        );
    }
}

export default Home;
