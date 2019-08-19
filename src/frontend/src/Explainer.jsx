import React from 'react';
import PropTypes from 'prop-types';
import storage from './storage.js';

const YouTubeVideo = (props) => {
    const { videoId, start } = props;
    return (
        <div>
          <iframe width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}?start=${start}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen>
          </iframe>
          <div>
            <tt>video: YouTube {videoId}</tt>
          </div>
        </div>
    );
};

class Explainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            explainer: null,
        };
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
                  <YouTubeVideo
                      key={idx}
                      videoId={v.videoId}
                      start={v.start}
                  />
              ))
              }
            </div>
        );
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
