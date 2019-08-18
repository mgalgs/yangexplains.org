import React from 'react';
import Explainer from './Explainer.jsx';

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

class MainApp extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
              <h1>Yang Explains!</h1>
              {testData.explainers.map(e => (
                  <Explainer key={e.id}
                             question={e.question}
                             answer={e.answer} />
              ))}
            </div>
        );
    }
}

export default MainApp;
