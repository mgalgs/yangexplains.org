from flask import Flask, jsonify, render_template

from .explainers import parse_explainers


app = Flask(__name__)
explainers = parse_explainers()


@app.route('/')
def view_index():
    return render_template('index.html')


@app.route('/api/questions')
def view_api_questions():
    return jsonify(explainers)
