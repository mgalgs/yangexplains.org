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
MANIFEST_URL = app.config.get('STATICS_MANIFEST_URL')


def get_statics():
    if not MANIFEST_URL:
        return
    rsp = requests.get(MANIFEST_URL)
    if rsp.status_code != 200:
        raise Exception(f"Couldn't get static manifest from {MANIFEST_URL}")
    return json.loads(rsp.text)


STATICS = get_statics()


def static_url(path):
    """
    If not found in the statics manifest, returns path.
    """
    if not MANIFEST_URL:
        return path
    # the manifest doesn't contain the /static prefix
    manifest_key = path[len(app.static_url_path):]
    mapped = STATICS["paths"].get(manifest_key)
    if mapped is None:
        return path
    url = app.static_url_path + mapped
    return url
