import { yangGet } from './network.js';

const _cache = {};

const storage = {
    fetchById: async (id) => {
        return await yangGet(`/api/question/${id}`);
    },
    getAllExplainers: async () => {
        if (!_cache.hasOwnProperty('explainers'))
            _cache.explainers = await yangGet(`/api/questions`);
        return _cache.explainers;
    },
};

export default storage;
