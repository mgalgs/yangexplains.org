import { yangGet } from './network.js';

const _cache = {};

const storage = {
    fetchById: async (id) => {
        return await yangGet(`/api/question/${id}`);
    },
    getAllExplainers: async () => {
        if (!_cache.hasOwnProperty('explainers')) {
            const [data, rsp] = await yangGet(`/api/questions`);
            if (rsp.ok) {
                _cache.explainers = data;
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
        return data;
    },
};

export default storage;
