import os
import json
import csv
import urllib
import re

import requests
from oauthlib.oauth2 import WebApplicationClient
from slugify import slugify

import click
from flask import (
    Flask,
    jsonify,
    redirect,
    render_template,
    request,
)
from sqlalchemy.orm import relationship
from sqlalchemy.exc import IntegrityError
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

from . import staticfiles

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

# context processors for our templates
@app.context_processor
def utility_processor():
    def static_url(url):
        return staticfiles.static_url(url)
    return dict(static_url=static_url)


def get_or_create(session, model, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    instance = model(**kwargs)
    session.add(instance)
    session.commit()
    return instance


def normalize_youtube_timestamp(ts):
    """
    Takes a timestamp string that could either be a straight number of
    seconds, or hour-minute-second encoded 01h03m42s, and returns the
    straight number of seconds as a string.
    """
    if 's' not in ts:
        return ts

    parts = re.split(r'[hms]', ts)
    nparts = len(parts)
    if nparts == 2:
        return parts[0]
    elif nparts == 3:
        minutes = parts[0]
        seconds = parts[1]
        return str((int(minutes) * 60) + int(seconds))
    elif nparts == 4:
        hours = parts[0]
        minutes = parts[1]
        seconds = parts[2]
        return str((int(minutes) * 60 * 60) +
                   (int(minutes) * 60) +
                   int(seconds))

    raise ValueError("Invalid youtube timestamp")


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
    is_admin = db.Column(db.Boolean, default=False)
    is_approver = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<User {self.id} ({self.email})>"

    @classmethod
    def get(cls, user_id):
        return cls.query.get(user_id)

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).one_or_none()

    def serialize(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_approver': self.is_approver,
        }

    def dumps(self):
        return json.dumps(self.serialize())


explainer_tags_assoc = db.Table(
    'explainer_tags',
    db.Column('explainer_id', db.Integer, db.ForeignKey('explainer.id'),
                             nullable=False),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), nullable=False),
)


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'text': self.text
        }


class Explainer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.Text, nullable=False, unique=True)
    slug = db.Column(db.Text, nullable=False)
    pending = db.Column(db.Boolean, default=True, nullable=False)
    submitter_id = db.Column(db.Integer, db.ForeignKey('user.id'),
                             nullable=False)
    views = db.Column(db.Integer, default=0, nullable=False)

    videos = relationship("ExplainerVideo")
    tags = relationship(Tag, secondary=explainer_tags_assoc,
                        backref="explainers")

    __mapper_args__ = {
        "order_by": views.desc(),
    }

    def __init__(self, *args, **kwargs):
        kwargs['slug'] = slugify(kwargs['question'])
        super().__init__(*args, **kwargs)

    @classmethod
    def all(cls):
        return cls.query.all()

    @classmethod
    def all_approved(cls):
        return cls.query.filter_by(pending=False)

    @classmethod
    def all_pending(cls):
        return cls.query.filter_by(pending=True)

    @classmethod
    def get(cls, explainer_id):
        return cls.query.get(explainer_id)

    def get_absolute_url(self):
        return f"/q/{self.id}/{self.slug}"

    def serialize(self):
        return {
            'id': self.id,
            'question': self.question,
            'slug': self.slug,
            'pending': self.pending,
            'answer': {
                'videos': [video.serialize() for video in self.videos],
            },
            'tags': [tag.serialize() for tag in self.tags],
            'submitter_id': self.submitter_id,
            'views': self.views,
        }


class ExplainerVideo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    explainer_id = db.Column(db.Integer, db.ForeignKey('explainer.id'),
                             nullable=False)
    # one of: ['youtube']
    video_provider = db.Column(db.Text, nullable=False)
    video_id = db.Column(db.Text, nullable=False)
    start = db.Column(db.Text, nullable=False)
    end = db.Column(db.Text, nullable=False, default='')
    description = db.Column(db.Text, nullable=True)

    def serialize(self):
        return {
            "videoId": self.video_id,
            "start": self.start,
            "end": self.end,
            "description": self.description,
        }


# Flask-Login helper to retrieve a user from our db
@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


def get_google_provider_cfg():
    return requests.get(app.config['GOOGLE_DISCOVERY_URL']).json()


@app.route('/')
@app.route('/a/<app_page>')
@app.route('/tag/<tag>')
@app.route('/q/<explainer_id>')
@app.route('/q/<explainer_id>/<slug>')
def view_index(explainer_id=None, app_page=None, slug=None, tag=None):
    site_base_url = app.config.get('SITE_BASE_URL') or 'http://localhost:5000'
    ctx = {
        # TODO: move to context processor
        'site_base_url': site_base_url,
    }
    if explainer_id:
        explainer = Explainer.get(explainer_id)
        if slug != explainer.slug:
            return redirect(explainer.get_absolute_url())
        ctx['explainer'] = explainer
    return render_template('index.html', **ctx)


def get_site_url(path):
    base_url = app.config.get('SITE_BASE_URL')
    if not base_url:
        base_url = request.base_url[:-len(request.path)]
    return f"{base_url}{path}"


# google login stuff based on https://realpython.com/flask-google-login/
@app.route("/login")
def login():
    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    redirect_url = get_site_url('/login/callback')

    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=redirect_url,
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@app.route("/login/callback")
def callback():
    code = request.args.get("code")

    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    redirect_url = get_site_url(request.path)
    auth_resp = get_site_url(request.full_path)
    # Prepare and send a request to get tokens! Yay tokens!
    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=auth_resp,
        redirect_url=redirect_url,
        code=code,
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
        if request.args.get('pending', False) == '1':
            explainers = Explainer.all_pending()
        else:
            explainers = Explainer.all_approved()
        return jsonify({
            'questions': [q.serialize() for q in explainers]
        })
    elif request.method == 'POST':
        if not current_user.is_authenticated:
            return jsonify({'error': 'Login required'}), 400

        try:
            question = request.json['question']
            video_id = request.json['videoId']
            start = request.json['start']
            end = request.json['end']
        except KeyError:
            return jsonify({'error': 'All fields are required'}), 400

        explainer = Explainer(question=question, submitter_id=current_user.id)
        if current_user.is_approver:
            explainer.pending = False
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


def handle_question_approve(explainer):
    explainer.pending = False
    db.session.commit()
    return jsonify(explainer.serialize())


def handle_question_add_tag(explainer):
    tagtext = request.json.get("text")
    if not tagtext:
        return jsonify({'error': 'text is required'}), 400
    tag = get_or_create(db.session, Tag, text=tagtext)
    tag.explainers.append(explainer)
    db.session.commit()
    return jsonify(explainer.serialize())


def handle_question_remove_tag(explainer):
    tag_id = request.json.get("tag_id")
    if not tag_id:
        return jsonify({'error': 'tag_id is required'}), 400
    tag = get_or_create(db.session, Tag, id=tag_id)
    tag.explainers.remove(explainer)
    db.session.commit()
    return jsonify(explainer.serialize())


def handle_question_view(explainer):
    explainer.views += 1
    db.session.commit()
    return jsonify(explainer.serialize())


@app.route('/api/question/<explainer_id>', methods=['GET', 'POST'])
def view_api_single_question(explainer_id):
    explainer = Explainer.get(explainer_id)
    if request.method == 'GET':
        if explainer is None or (
                explainer.pending
                and not current_user.is_approver
                and not explainer.submitter_id == current_user.id
        ):
            return jsonify({'error': 'Not found'}), 404
        return jsonify(explainer.serialize())
    elif request.method == 'POST':
        # to be able to modify an Explainer, you need to be an approver or
        # the submitter.
        if not current_user.is_authenticated:
            return jsonify({'error': 'Login required'}), 400
        if not any((current_user.is_approver,
                    current_user.id == explainer.submitter_id)):
            return jsonify({
                'error': 'Must be an approver or the submitter for that',
            }), 400

        action = request.json.get('action')
        if action == 'approve':
            return handle_question_approve(explainer)
        elif action == 'add_tag':
            return handle_question_add_tag(explainer)
        elif action == 'remove_tag':
            return handle_question_remove_tag(explainer)
        elif action == 'view':
            return handle_question_view(explainer)
        else:
            return jsonify({'error': 'Unsupported action'}), 400


@app.cli.command("sync-db-from-prod")
@click.option("--url", default="https://yangexplains.org/api/questions")
def cmd_sync_questions_from_prod(url):
    print(f"Will sync questions from {url}. Continue? [y/N]")
    response = input(">>> ")
    if not any((response == 'y',
                response == 'Y')):
        print("Bailing")
        return

    rsp = requests.get(url)
    if not rsp.ok:
        print(f"GET of {url} failed with {rsp}")
        return

    first_user = User.query.order_by(User.id).first()
    data = json.loads(rsp.text)
    ExplainerVideo.query.delete()
    Explainer.query.delete()
    db.session.commit()

    nquestions = 0
    nvideos = 0
    for question in data['questions']:
        explainer = Explainer(
            question=question['question'],
            pending=question['pending'],
            submitter_id=first_user.id, # TODO: put submitter id in API so
                                        # we can grab it here?
        )
        db.session.add(explainer)
        db.session.commit()
        nquestions += 1
        for video in question['answer']['videos']:
            video = ExplainerVideo(
                explainer_id=explainer.id,
                video_provider='youtube',
                video_id=video['videoId'],
                start=video['start'],
                end=video['end'],
            )
            db.session.add(video)
            db.session.commit()
            nvideos += 1

    print(f"Synced {nquestions} questions and {nvideos} videos from {url}")


@app.cli.command("import-from-yl-csv")
@click.argument("filename")
def cmd_import_from_yl_csv(filename):
    """
    The YangLinks folks have been kind enough to share a csv of their
    dataset.  This command imports it into our database.
    """
    print(f"Will import questions from {filename}")

    first_user = User.query.order_by(User.id).first()

    with open(filename) as csvfile:
        reader = csv.reader(csvfile)
        data = [row for row in reader]

    for row in data:
        (last_edit, category, objection, response, link, tags) = row
        ures = urllib.parse.urlparse(link)
        netloc = ures.netloc.strip()
        path = ures.path.strip()
        video_id = path.lstrip('/')
        query = ures.query.strip()
        question = objection.strip()

        if netloc != 'youtu.be':
            print(f"Unsupported netloc: {netloc}. Skipping.")
            continue

        explainer = Explainer(
            question=question,
            pending=False,
            submitter_id=first_user.id,
        )
        db.session.add(explainer)
        try:
            db.session.commit()
        except IntegrityError as e:
            db.session.rollback()
            print(f"Error during import {e}. Skipping")
            continue

        for tagtext in tags.split(','):
            tagtext = tagtext.strip()
            tag = get_or_create(db.session, Tag, text=tagtext)
            tag.explainers.append(explainer)

        qsdict = urllib.parse.parse_qs(query)
        start = normalize_youtube_timestamp(qsdict.get('t', ['0'])[0])

        video = ExplainerVideo(
            explainer_id=explainer.id,
            video_provider='youtube',
            video_id=video_id,
            start=start,
            end='',
            description=response,
        )
        db.session.add(video)
        db.session.commit()

        print(f"Imported Explainer: {explainer.serialize()}")
