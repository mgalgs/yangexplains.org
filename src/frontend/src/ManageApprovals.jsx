import React from 'react';
import PropTypes from 'prop-types';
import Explainer from './Explainer.jsx';
import storage from './storage.js';

class ManageApprovals extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pendingExplainers: [],
            activeExplainer: null,
        };

        this.setActiveExplainer = this.setActiveExplainer.bind(this);
    }

    async componentDidMount() {
        const explainers = await storage.getPendingExplainers();
        if (!explainers) {
            /* TODO: alert :( */
            alert("Couldn't fetch explainers :(");
            return;
        }
        this.setState({pendingExplainers: explainers.questions});
    }

    render() {
        const { activeExplainer } = this.state;
        return (
            <div>
              {activeExplainer &&
               <div>
                 <button className="btn btn-outline-info mb-5" onClick={() => this.setActiveExplainer(null)}>Back</button>
                 <Explainer explainer={activeExplainer} />
               </div>
              }
              <ul>
                {this.state.pendingExplainers.map(explainer => (
                    <li key={explainer.id}>
                      <a href="#"
                         onClick={(e) => {
                             e.preventDefault();
                             this.setActiveExplainer(explainer);
                         }}>
                        {explainer.question}
                      </a>
                    </li>
                ))}
              </ul>
            </div>
        );
    }

    setActiveExplainer(explainer) {
        this.setState({activeExplainer: explainer});
    }
}

export default ManageApprovals;
