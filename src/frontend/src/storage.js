import { yangGet } from './network.js';
import { getExplainerUrl } from './urls.js';

const _cache = {};

const _augmentExplainer = (explainer) => {
    explainer.isApproverOrSubmitter = YangConfig.isApprover
        || YangConfig.userId === explainer.submitter_id;
    explainer.apiUrl = `/api/question/${explainer.id}`;
    explainer.prettyUrl = getExplainerUrl(explainer);
};

const storage = {
    fetchById: async (id) => {
        const [data, rsp] = await yangGet(`/api/question/${id}`);
        _augmentExplainer(data);
        return [data, rsp];
    },
    augmentExplainer: (explainer) => {
        _augmentExplainer(explainer);
    },
    getAllExplainers: async () => {
        if (!_cache.hasOwnProperty('explainers')) {
            const [data, rsp] = await yangGet(`/api/questions`);
            if (rsp.ok) {
                const explainers = data.questions;
                for (const explainer of explainers)
                    _augmentExplainer(explainer);
                _cache.explainers = explainers;
            } else {
                console.error("Couldn't fetch explainers :(");
                return [];
            }
        }
        return _cache.explainers;
    },
    invalidateCaches: () => {
        delete _cache.explainers;
    },
    getPendingExplainers: async () => {
        const [data, rsp] = await yangGet(`/api/questions?pending=1`);
        if (!rsp.ok) {
            console.error("Couldn't fetch pendingExplainers :(");
            return [];
        }
        const explainers = data.questions;
        for (const explainer of explainers)
            _augmentExplainer(explainer);
        return explainers;
    },
};

export default storage;
