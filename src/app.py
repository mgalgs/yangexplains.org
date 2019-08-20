from flask import Flask, jsonify, render_template

from .explainers import parse_explainers


app = Flask(__name__)
explainers = parse_explainers()


@app.route('/')
@app.route('/q/<explainerId>')
def view_index(explainerId=None):
    return render_template('index.html')


@app.route('/api/questions')
def view_api_questions():
    return jsonify(explainers)
