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

const urls = {
    api: {
        explainerById: explainerApiById,
        explainer: explainerApi,
        allExplainers: () => '/api/questions',
        allPendingExplainers: () => '/api/questions?pending=1',
    },
    pretty: {
        explainer: explainerPretty,
        tag: tagPretty,
    },
};

export default urls;
