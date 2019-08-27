import PropTypes from 'prop-types';

const videoShape = PropTypes.shape({
    start: PropTypes.string.isRequired,
    end: PropTypes.string,
    videoId: PropTypes.string.isRequired,
});

const explainerShape = PropTypes.shape({
    question: PropTypes.string.isRequired,
    answer: PropTypes.shape({
        videos: PropTypes.arrayOf(videoShape),
    }).isRequired,
});

export { explainerShape, videoShape };
