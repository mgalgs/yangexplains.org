import os


class Config(object):
    DEBUG = False
    TESTING = False

    pguser = os.environ['POSTGRES_USER']
    pgpassword = os.environ['POSTGRES_PASSWORD']
    pghost = os.environ['POSTGRES_HOST']
    pgdb = os.environ['POSTGRES_DB']
    SQLALCHEMY_DATABASE_URI = \
        f'postgresql+psycopg2://{pguser}:{pgpassword}@{pghost}/{pgdb}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class ProductionConfig(Config):
    DEBUG = False


class DevelopmentConfig(Config):
    DEBUG = True
