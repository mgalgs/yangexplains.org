import React from 'react';
import PropTypes from 'prop-types';

const YouTubeVideo = (props) => {
    const { videoId, start } = props;
    return (
        <div>
          video: {videoId}
          <iframe width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${videoId}?start=${start}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen>
          </iframe>
        </div>
    );
};

class Explainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: true,
        };
        this.onQuestionClick = this.onQuestionClick.bind(this);
    }

    render() {
        return (
            <div>
              <h3 onClick={this.onQuestionClick}>
                {this.props.question}
              </h3>
              {this.state.collapsed ||
               this.props.answer.videos.map((v, idx) => (
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

    onQuestionClick() {
        this.setState((prevState) => ({
            collapsed: !prevState.collapsed,
        }));
    }
}

Explainer.propTypes = {
    question: PropTypes.string.isRequired,
    answer: PropTypes.shape({
        videos: PropTypes.arrayOf(PropTypes.shape({
            start: PropTypes.string.isRequired,
            end: PropTypes.string.isRequired,
            videoId: PropTypes.string.isRequired,
        })),
    }).isRequired,
};

export default Explainer;
