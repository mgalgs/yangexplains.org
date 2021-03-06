import PropTypes from 'prop-types';

const videoShape = PropTypes.shape({
    start: PropTypes.string.isRequired,
    end: PropTypes.string,
    videoId: PropTypes.string.isRequired,
});

const explainerShape = PropTypes.shape({
    question: PropTypes.string.isRequired,
    slug: PropTypes.string,
    answer: PropTypes.shape({
        videos: PropTypes.arrayOf(videoShape),
    }).isRequired,
});

const tagShape = PropTypes.shape({
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
});

export { explainerShape, videoShape, tagShape };
