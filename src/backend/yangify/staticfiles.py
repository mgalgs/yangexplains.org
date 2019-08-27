"""
Static files mapper.  When STATICS_MANIFEST_URL is set in the app
config, downloads the json manifest found at that location and maps
non-hashed filenames to hashed ones as per the manifest.

This is useful in production for cache-busting static resources.

This shouldn't be used in development.  Instead, flask itself should just
serve the statics from the ./static directory.  In that case,
STATICS_MANIFEST_URL should not be set, which will cause this module to
simply return the non-hashed path.
"""


import os
import json

import requests

from flask import Flask


app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
manifest_url = app.config.get('STATICS_MANIFEST_URL')


def get_statics():
    if not manifest_url:
        return
    rsp = requests.get(manifest_url)
    if rsp.status_code != 200:
        raise Exception(f"Couldn't get static manifest from {manifest_url}")
    return json.loads(rsp.text)


STATICS = get_statics()


def static_url(path):
    """
    If not found in the statics manifest, returns path.
    """
    if not manifest_url:
        return path
    return STATICS["paths"].get(path, path)
