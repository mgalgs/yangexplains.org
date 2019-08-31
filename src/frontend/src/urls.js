const getExplainerUrl = (explainer) => {
    if (explainer.slug)
        return `/q/${explainer.id}/${explainer.slug}`;
    return `/q/${explainer.id}`;
};

const getTagUrl = (tagtext) => {
    return `/tag/${tagtext}`;
};

export { getExplainerUrl, getTagUrl };
