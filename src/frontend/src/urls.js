const getExplainerUrl = (explainer) => {
    if (explainer.slug)
        return `/q/${explainer.id}/${explainer.slug}`;
    return `/q/${explainer.id}`;
};

export { getExplainerUrl };
