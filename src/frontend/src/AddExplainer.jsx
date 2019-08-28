import React from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import { yangPost } from './network.js';
import Explainer from './Explainer.jsx';

/**
 * Normalizes input to be seconds only.
 * Examples:
 *   - 1:50 => 110
 *   - 1:10:50 => 3710
 *   - 150 => 150
 */
const normalizeVideoTime = (time) => {
    const parts = time.split(":");
    let hours, minutes, seconds, totalSeconds;
    switch (parts.length) {
    case 1:
        return time;
    case 2:
        minutes = parseInt(parts[0], 10);
        seconds = parseInt(parts[1], 10);
        totalSeconds = (minutes * 60) + seconds;
        return totalSeconds.toString();
    case 3:
        hours = parseInt(parts[0], 10);
        minutes = parseInt(parts[1], 10);
        seconds = parseInt(parts[2], 10);
        totalSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;
        return totalSeconds.toString();
    default:
        throw "Unhandled time format";
    }
};

class AddExplainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            question: '',
            videoId: '',
            start: '',
            end: '',
            explainerPreview: null,
        };

        this.url = '/api/questions';

        this.handleInputChange = this.handleInputChange.bind(this);
        this.onSubmitClick = this.onSubmitClick.bind(this);
        this.onVideoIdBlur = this.onVideoIdBlur.bind(this);
        this.recomputePreview = this.recomputePreview.bind(this);
    }

    handleInputChange() {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value,
        }, this.recomputePreview);
    }

    onVideoIdBlur() {
        let url;
        try {
            url = new URL(this.state.videoId);
        } catch (error) {
            return;
        }

        let videoId, start;
        switch(url.host) {
        case "youtu.be":
            videoId = url.pathname.slice(1);
            start = url.searchParams.get("t") || "";
            break;
        case "www.youtube.com":
        case "youtube.com":
            videoId = url.searchParams.get("v") || "";
            start = url.searchParams.get("t") || "";
            break;
        }
        this.setState({videoId, start}, this.recomputePreview);
    }

    async onSubmitClick() {
        const start = normalizeVideoTime(this.state.start);
        const end = normalizeVideoTime(this.state.end);
        const [data, rsp] = await yangPost(this.url, {
            question: this.state.question,
            videoId: this.state.videoId,
            start,
            end,
        });
        if (!rsp.ok) {
            alert(`Error: {data.error}`);
            return;
        }
        this.props.history.push(`/q/${data.id}`);
    }

    recomputePreview() {
        let explainerPreview = null;
        const { question, videoId, start } = this.state;
        if (question && videoId && start) {
            explainerPreview = {
                question,
                answer: {videos: [{videoId, start}]},
            };
        }
        this.setState({explainerPreview});
    }

    render() {
        return (
            <div>
              <div className="form-group">
                <div>
                  <Link to="/">Back</Link>
                </div>
                <h5>Submit a question and answer</h5>
                <label>Question</label>
                <input name="question"
                       value={this.state.question}
                       onChange={this.handleInputChange}
                       type="text"
                       className="form-control"
                       placeholder="What is a VAT?" />
              </div>
              <div className="form-group">
                <label>YouTube Link</label>
                <input name="videoId"
                       value={this.state.videoId}
                       onChange={this.handleInputChange}
                       onBlur={this.onVideoIdBlur}
                       type="text"
                       className="form-control"
                       placeholder="Example: https://youtu.be/hS9wOdenEys?t=139" />
              </div>
              <div className="form-group">
                <label>Start time code</label>
                <input name="start"
                       value={this.state.start}
                       onChange={this.handleInputChange}
                       type="text"
                       className="form-control"
                       placeholder="Seconds" />
              </div>
              <div className="form-group">
                <label>End time code (optional)</label>
                <input name="end"
                       value={this.state.end}
                       onChange={this.handleInputChange}
                       type="text"
                       className="form-control"
                       placeholder="Seconds" />
              </div>
              <button type="button" className="btn btn-info" onClick={this.onSubmitClick}>Submit</button>
              {this.state.explainerPreview &&
               <div>
                 <h3>Preview:</h3>
                 <Explainer explainer={this.state.explainerPreview} />
               </div>
              }
            </div>
        );
    }
}

export default AddExplainer;
