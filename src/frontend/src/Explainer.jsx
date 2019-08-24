import React from 'react';
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';
import storage from './storage.js';
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
    }

    async componentDidMount() {
        if (this.props.explainer)
            return;

        const [data, rsp] = await storage.fetchById(this.props.id);
        if (!rsp.ok) {
            /* TODO: toastify! */
            this.setState({error: data.error});
            return;
        }
        this.setState({explainer: data});
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
              {explainer.pending &&
               <div className="alert alert-info">
                 This explainer is PENDING
                 <button className="btn btn-success mx-5"
                         onClick={this.onApproveClick}>Approve</button>
               </div>
              }
              <h3 onClick={this.onQuestionClick}>
                {question}
              </h3>
              {answer.videos.map((v, idx) => (
                  <YouTube
                      key={idx}
                      videoId={v.videoId}
                      onReady={(e) => {this.onVideoReady(e, v);}} />
              ))}
            </div>
        );
    }

    onVideoReady(e, video) {
        const player = e.target;
        player.seekTo(video.start);
        player.playVideo();
    }

    onApproveClick() {
        alert("TODO!");
    }
}

Explainer.propTypes = {
    /* one of id or explainer is required */
    id: PropTypes.number,
    explainer: explainerShape,
};

export default Explainer;
