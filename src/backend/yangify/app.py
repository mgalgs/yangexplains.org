import os

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate


app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
db = SQLAlchemy(app)
migrate = Migrate(app, db)


class User(db.Model):
    id = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text)
    email = db.Column(db.Text, unique=True, nullable=False)


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
