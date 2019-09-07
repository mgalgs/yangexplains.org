const explainerPretty = (explainer) => {
    if (explainer.slug)
        return `/q/${explainer.id}/${explainer.slug}`;
    return `/q/${explainer.id}`;
};

const explainerApiById = (id) => {
    return `/api/question/${id}`;
};

const explainerApi = (explainer) => {
    return explainerApiById(explainer.id);
};

const tagPretty = (tag) => {
    return `/tag/${tag.text}`;
};

const sanitize = (fn) => {
    return (url) => encodeURI(fn(url));
};

const urls = {
    api: {
        explainerById: sanitize(explainerApiById),
        explainer: sanitize(explainerApi),
        allExplainers: () => '/api/questions',
        allPendingExplainers: () => '/api/questions?pending=1',
    },
    pretty: {
        explainer: sanitize(explainerPretty),
        tag: sanitize(tagPretty),
    },
};

export default urls;
