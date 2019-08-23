import React from 'react';
import PropTypes from 'prop-types';
import { yangPost } from './network.js';

class AddExplainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            question: '',
            videoId: '',
            start: '',
            end: '',
        };

        this.url = '/api/questions';

        this.handleInputChange = this.handleInputChange.bind(this);
        this.onSubmitClick = this.onSubmitClick.bind(this);
    }

    handleInputChange() {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value,
        });
    }

    async onSubmitClick() {
        const [data, rsp] = await yangPost(this.url, {
            question: this.state.question,
            videoId: this.state.videoId,
            start: this.state.start,
            end: this.state.end,
        });
        if (!rsp.ok) {
            alert(`Error: {data.error}`);
            return;
        }
        this.props.history.push(`/q/${data.id}`);
    }

    render() {
        return (
            <div>
              <div className="form-group">
                <label>Question</label>
                <input name="question"
                       value={this.state.question}
                       onChange={this.handleInputChange}
                       type="text"
                       className="form-control" />
              </div>
              <div className="form-group">
                <label>YouTube Video ID</label>
                <input name="videoId"
                       value={this.state.videoId}
                       onChange={this.handleInputChange}
                       type="text"
                       className="form-control"
                       placeholder="Example: cTsEzmFamZ8" />
              </div>
              <div className="form-group">
                <label>Start time (seconds)</label>
                <input name="start"
                       value={this.state.start}
                       onChange={this.handleInputChange}
                       type="text"
                       className="form-control"
                       placeholder="Example: 504" />
              </div>
              <div className="form-group">
                <label>End time (seconds)</label>
                <input name="end"
                       value={this.state.end}
                       onChange={this.handleInputChange}
                       type="text"
                       className="form-control"
                       placeholder="Example: 892" />
              </div>
              <button type="button" className="btn btn-info" onClick={this.onSubmitClick}>Submit</button>
            </div>
        );
    }
}

export default AddExplainer;
