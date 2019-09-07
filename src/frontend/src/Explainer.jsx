import React from 'react';
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';
import MetaTags from 'react-meta-tags';
import { withRouter } from "react-router";

import storage from './storage.js';
import { yangPost } from './network.js';
import urls from './urls.js';
import { explainerShape } from './shapes.js';
import ExplainerTags from './ExplainerTags.jsx';

class Explainer extends React.Component {
    constructor(props) {
        super(props);

        if (!props.id && !props.explainer)
            throw "Must provide either id or explainer";

        this.state = {
            explainer: props.explainer,
            error: null,
        };

        this.onVideoReady = this.onVideoReady.bind(this);
        this.onApproveClick = this.onApproveClick.bind(this);
        this.refreshAddThis = this.refreshAddThis.bind(this);
        this.onTagAdd = this.onTagAdd.bind(this);
    }

    refreshAddThis() {
        if (this.props.includeShareButtons
            && typeof addthis !== 'undefined'
            && addthis.layers.refresh) {
            addthis.update("share", "url", this.state.explainer.prettyUrl);
            addthis.update("share", "title", this.state.explainer.question);
            addthis.layers.refresh();
        }
    }

    async componentDidMount() {
        if (!this.props.explainer) {
            const [explainer, rsp] = await storage.fetchById(this.props.id);
            if (!rsp.ok) {
                /* TODO: toastify! */
                this.setState({error: explainer.error});
                return;
            }
            this.setState({explainer});
            storage.viewStatExplainer(explainer);
        }

        this.refreshAddThis();
    }

    componentDidUpdate() {
        this.refreshAddThis();
    }

    render() {
        if (this.state.error) {
            return (
                <div className="alert alert-danger" role="alert">
                  {this.state.error}
                </div>
            );
        }
        if (!this.state.explainer)
            return <div>...loading...</div>;

        const { explainer } = this.state;
        const { question, answer } = explainer;

        return (
            <div>
              <MetaTags>
                <title>Yang Explains -- {question}</title>
                <meta name="description" content={`Andrew Yang explains -- ${question}`} />
                <meta property="og:title" content="Yang Explains" />
                <meta property="og:image" content={YangConfig.logo} />
              </MetaTags>

              {explainer.pending &&
               <div className="alert alert-info">
                 This explainer is PENDING
                 {YangConfig.isApprover &&
                  <button className="btn btn-success mx-5"
                          onClick={this.onApproveClick}>Approve</button>
                 }
               </div>
              }
              <h3 onClick={this.onQuestionClick}>
                {question}
              </h3>
              {answer.videos.map((v, idx) => (
                  <div key={idx}>
                    <YouTube
                        className="embed-responsive-item"
                        containerClassName="embed-responsive embed-responsive-16by9"
                        videoId={v.videoId}
                        onReady={(e) => {this.onVideoReady(e, v);}} />
                    {v.description &&
                     <div className="card bg-light my-3">
                       <div className="card-body">
                         <p className="card-text">{v.description}</p>
                       </div>
                     </div>
                    }
                  </div>
              ))}
              <ExplainerTags explainer={explainer}
                             onAdd={this.onTagAdd} />
              {/* Go to www.addthis.com/dashboard to customize your tools */}
              {this.props.includeShareButtons &&
               <div className="addthis_inline_share_toolbox mt-3" />
              }
            </div>
        );
    }

    onTagAdd(explainer) {
        this.setState({explainer});
    }

    onVideoReady(e, video) {
        const player = e.target;
        player.seekTo(video.start);
        player.playVideo();
    }

    async onApproveClick() {
        const [data, rsp] = await yangPost(this.state.explainer.apiUrl, {action: 'approve'});
        if (!rsp.ok) {
            alert("Something went wrong, please try again");
            return;
        }
        storage.invalidateCaches();
        this.props.history.push(urls.pretty.explainer(data));
    }
}

Explainer.propTypes = {
    /* one of id or explainer is required */
    id: PropTypes.number,
    explainer: explainerShape,
    includeShareButtons: PropTypes.bool,
};

Explainer.defaultProps = {
    includeShareButtons: true,
};

export default withRouter(Explainer);
