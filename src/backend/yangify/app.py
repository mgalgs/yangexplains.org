import os

from flask import Flask, jsonify, render_template


app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])


@app.route('/')
@app.route('/q/<explainerId>')
def view_index(explainerId=None):
    return render_template('index.html')


@app.route('/privacy')
def view_privacy(explainerId=None):
    return render_template('privacy.html')


@app.route('/api/questions')
def view_api_questions():
    return jsonify({'results': [1, 2, 3]})
