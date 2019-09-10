import { yangGet, yangPost } from './network.js';
import urls from './urls.js';

const _cache = {};

const _augmentExplainer = (explainer) => {
    explainer.isApproverOrSubmitter = YangConfig.isApprover
        || YangConfig.userId === explainer.submitter_id;
    explainer.apiUrl = urls.api.explainer(explainer);
    explainer.prettyUrl = urls.pretty.explainer(explainer);
    return explainer;
};

const storage = {
    fetchById: async (id) => {
        const [data, rsp] = await yangGet(urls.api.explainerById(id));
        _augmentExplainer(data);
        return [data, rsp];
    },
    augmentExplainer: (explainer) => {
        return _augmentExplainer(explainer);
    },
    getAllExplainers: async () => {
        if (!_cache.hasOwnProperty('explainers')) {
            _cache.explainers = new Promise(async (resolve, reject) => {
                const [data, rsp] = await yangGet(urls.api.allExplainers());
                if (rsp.ok) {
                    const explainers = data.questions;
                    for (const explainer of explainers)
                        _augmentExplainer(explainer);
                    resolve(explainers);
                } else {
                    reject([]);
                }
            });
        }
        return await _cache.explainers;
    },
    invalidateCaches: () => {
        delete _cache.explainers;
    },
    getPendingExplainers: async () => {
        const [data, rsp] = await yangGet(urls.api.allPendingExplainers());
        if (!rsp.ok) {
            console.error("Couldn't fetch pendingExplainers :(");
            return [];
        }
        const explainers = data.questions;
        for (const explainer of explainers)
            _augmentExplainer(explainer);
        return explainers;
    },
    viewStatExplainer: (explainer) => {
        yangPost(explainer.apiUrl, {'action': 'view'});
    },
};

export default storage;
