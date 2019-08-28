import React from 'react';
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';
import MetaTags from 'react-meta-tags';
import { withRouter } from "react-router";

import storage from './storage.js';
import { yangPost } from './network.js';
import { getExplainerUrl } from './urls.js';
import { explainerShape } from './shapes.js';

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
    }

    refreshAddThis() {
        if (this.props.includeShareButtons
            && typeof addthis !== 'undefined'
            && addthis.layers.refresh) {
            addthis.update("share", "url", getExplainerUrl(this.state.explainer));
            addthis.update("share", "title", this.state.explainer.question);
            addthis.layers.refresh();
        }
    }

    async componentDidMount() {
        if (!this.props.explainer) {
            const [data, rsp] = await storage.fetchById(this.props.id);
            if (!rsp.ok) {
                /* TODO: toastify! */
                this.setState({error: data.error});
                return;
            }
            this.setState({explainer: data});
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
                 {YangConfig.user.is_approver &&
                  <button className="btn btn-success mx-5"
                          onClick={this.onApproveClick}>Approve</button>
                 }
               </div>
              }
              <h3 onClick={this.onQuestionClick}>
                {question}
              </h3>
              {answer.videos.map((v, idx) => (
                  <YouTube
                      key={idx}
                      className="embed-responsive-item"
                      containerClassName="embed-responsive embed-responsive-16by9"
                      videoId={v.videoId}
                      onReady={(e) => {this.onVideoReady(e, v);}} />
              ))}
              {/* Go to www.addthis.com/dashboard to customize your tools */}
              {this.props.includeShareButtons &&
               <div className="addthis_inline_share_toolbox mt-3" />
              }
            </div>
        );
    }

    onVideoReady(e, video) {
        const player = e.target;
        player.seekTo(video.start);
        player.playVideo();
    }

    async onApproveClick(explainer) {
        const eid = this.state.explainer.id;
        const [data, rsp] = await yangPost(`/api/question/${eid}`);
        if (!rsp.ok) {
            alert("Something went wrong, please try again");
            return;
        }
        storage.invalidateCaches();
        this.props.history.push(getExplainerUrl(data));
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
