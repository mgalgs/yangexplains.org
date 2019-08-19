import React from 'react';
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';
import storage from './storage.js';

class Explainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            explainer: null,
        };

        this.onVideoReady = this.onVideoReady.bind(this);
    }

    async componentDidMount() {
        const explainer = await storage.fetchById(this.props.id);
        this.setState({explainer});
    }

    render() {
        if (!this.state.explainer)
            return <div>...loading...</div>;

        const { question, answer } = this.state.explainer;

        return (
            <div>
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
}

const explainerShape = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.shape({
        videos: PropTypes.arrayOf(PropTypes.shape({
            start: PropTypes.string.isRequired,
            end: PropTypes.string.isRequired,
            videoId: PropTypes.string.isRequired,
        })),
    }).isRequired,
};

Explainer.propTypes = {
    id: PropTypes.number.isRequired,
};

export default Explainer;
