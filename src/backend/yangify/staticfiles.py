import os
import json

import requests

from flask import Flask


app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])


def get_statics():
    url = app.config['STATICS_INTERNAL_BASE_URL'] + 'staticfiles.json'
    rsp = requests.get(url)
    if rsp.status_code != 200:
        raise Exception("Couldn't get static manifest")
    return json.loads(rsp.text)


STATICS = get_statics()


def static_url(path):
    """
    If not found in the statics manifest, returns the same path.
    """
    if not app.config['STATICS_NON_HASHED']:
        path = STATICS["paths"].get(path, path)
    return app.config['STATICS_URL_PREFIX'] + path
