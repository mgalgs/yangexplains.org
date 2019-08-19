const testData = {
    explainers: [{
        id: 1,
        question: "How y'all payin' for it?",
        answer: {
            videos: [{
                videoId: "cTsEzmFamZ8",
                start: "8:24",
                end: "14:52"
            }],
        },
    }, {
        id: 2,
        question: "How will ye olde VAT affect American companies?",
        answer: {
            videos: [{
                videoId: "cTsEzmFamZ8",
                start: "14:51",
                end: "15:53"
            }],
        },
    }],
};

const storage = {
    fetchById: async (id) => {
        for (const explainer of testData.explainers) {
            if (explainer.id === id)
                return explainer;
        }
        return null;
    },
    getAllExplainers: () => {
        return testData.explainers;
    },
};

export default storage;
