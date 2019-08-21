#!/bin/bash

export FLASK_ENV=${FLASK_ENV:-development}
export PYTHONPATH=/app
cd /app/yangify
flask run --host=0.0.0.0
