import os
import json

import requests
from oauthlib.oauth2 import WebApplicationClient

from flask import (
    Flask,
    jsonify,
    redirect,
    render_template,
    request,
)
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import (
    LoginManager,
    UserMixin,
    current_user,
    login_required,
    login_user,
    logout_user,
)


app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
db = SQLAlchemy(app)
migrate = Migrate(app, db)

if app.config['DEBUG']:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# User session management setup
# https://flask-login.readthedocs.io/en/latest
login_manager = LoginManager()
login_manager.init_app(app)

# OAuth 2 client setup
client = WebApplicationClient(app.config['GOOGLE_OAUTH_CLIENT_ID'])


class GoogleUser(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    identifier = db.Column(db.Text, primary_key=True)
    name = db.Column(db.Text)
    profile_pic = db.Column(db.Text)

    @classmethod
    def get_by_identifier(cls, ident):
        return cls.query.filter_by(identifier=ident).one_or_none()


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    provider = db.Column(db.Text)
    email = db.Column(db.Text, unique=True, nullable=False)

    @classmethod
    def get(cls, user_id):
        return cls.query.get(user_id)

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).one_or_none()


class Explainer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False, unique=True)

    videos = relationship("ExplainerVideo")

    @classmethod
    def all(cls):
        return cls.query.all()

    @classmethod
    def get(cls, explainer_id):
        return cls.query.get(explainer_id)

    def serialize(self):
        return {
            'id': self.id,
            'question': self.question,
            'answer': {
                'videos': [{
                    "videoId": video.video_id,
                    "start": video.start,
                    "end": video.end,
                } for video in self.videos],
            }
        }


class ExplainerVideo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    explainer_id = db.Column(db.Integer, db.ForeignKey('explainer.id'),
                             nullable=False)
    # one of: ['youtube']
    video_provider = db.Column(db.Text, nullable=False)
    video_id = db.Column(db.Text, nullable=False)
    start = db.Column(db.Text, nullable=False)
    end = db.Column(db.Text, nullable=False)


# Flask-Login helper to retrieve a user from our db
@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


def get_google_provider_cfg():
    return requests.get(app.config['GOOGLE_DISCOVERY_URL']).json()


@app.route('/')
@app.route('/add')
@app.route('/q/<explainerId>')
def view_index(explainerId=None):
    return render_template('index.html')


# google login stuff based on https://realpython.com/flask-google-login/
@app.route("/login")
def login():
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@app.route("/login/callback")
def callback():
    code = request.args.get("code")

    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    # Prepare and send a request to get tokens! Yay tokens!
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code
    )
    client_id = app.config['GOOGLE_OAUTH_CLIENT_ID']
    client_secret = app.config['GOOGLE_OAUTH_CLIENT_SECRET']
    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(client_id, client_secret),
    )

    # Parse the tokens!
    client.parse_request_body_response(json.dumps(token_response.json()))

    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        name = userinfo_response.json()["given_name"]
    else:
        return "User email not available or not verified by Google.", 400

    user = User.get_by_email(email)
    if user is not None:
        print(f"Logging in existing user {user.id}")
        login_user(user)
        return redirect("/")

    guser = GoogleUser.get_by_identifier(unique_id)
    if guser is not None:
        return "Account already created with that Google account", 400

    user = User(provider="GoogleUser", email=email)
    db.session.add(user)
    db.session.commit()  # need to commit to get a user.id
    print(f"Created new user {user.id}")
    guser = GoogleUser(
        user_id=user.id,
        identifier=unique_id,
        name=name,
        profile_pic=picture,
    )
    db.session.add(guser)
    db.session.commit()
    login_user(user)
    return redirect("/")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect("/")


@app.route('/privacy')
def view_privacy(explainerId=None):
    return render_template('privacy.html')


@app.route('/api/questions', methods=['GET', 'POST'])
def view_api_questions():
    if request.method == 'GET':
        return jsonify({'questions': [q.serialize() for q in Explainer.all()]})
    elif request.method == 'POST':
        try:
            question = request.json['question']
            video_id = request.json['videoId']
            start = request.json['start']
            end = request.json['end']
        except KeyError:
            return jsonify({'error': 'All fields are required'}), 400

        explainer = Explainer(question=question)
        db.session.add(explainer)
        db.session.commit()
        video = ExplainerVideo(
            explainer_id=explainer.id,
            video_provider='youtube',
            video_id=video_id,
            start=start,
            end=end,
        )
        db.session.add(video)
        db.session.commit()
        return jsonify(explainer.serialize())


@app.route('/api/question/<explainer_id>', methods=['GET'])
def view_api_single_question(explainer_id):
    return jsonify(Explainer.get(explainer_id).serialize())
