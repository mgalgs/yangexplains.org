import os


class Config(object):
    SECRET_KEY = os.environ['SECRET_KEY']
    DEBUG = False
    TESTING = False
    SITE_BASE_URL = os.environ.get('SITE_BASE_URL')
    # disable caching with built-in flask server
    SEND_FILE_MAX_AGE_DEFAULT = 0

    pguser = os.environ['POSTGRES_USER']
    pgpassword = os.environ['POSTGRES_PASSWORD']
    pghost = os.environ['POSTGRES_HOST']
    pgdb = os.environ['POSTGRES_DB']
    SQLALCHEMY_DATABASE_URI = \
        f'postgresql+psycopg2://{pguser}:{pgpassword}@{pghost}/{pgdb}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    GOOGLE_OAUTH_CLIENT_ID = os.environ["GOOGLE_OAUTH_CLIENT_ID"]
    GOOGLE_OAUTH_CLIENT_SECRET = os.environ["GOOGLE_OAUTH_CLIENT_SECRET"]
    GOOGLE_DISCOVERY_URL = \
        "https://accounts.google.com/.well-known/openid-configuration"


class ProductionConfig(Config):
    DEBUG = False
    STATICS_MANIFEST_URL = 'http://nginx/static/staticfiles.json'


class DevelopmentConfig(Config):
    DEBUG = True
