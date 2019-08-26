#!/bin/bash

export FLASK_ENV=${FLASK_ENV:-development}
export PYTHONPATH=/app

PORT=${PORT:-5000}
HOST=${HOST:-0.0.0.0}
NUM_WORKERS=${NUM_WORKERS:-$(expr $(nproc) '*' 2)}

if [[ $FLASK_ENV = development ]]; then
    cd /app/yangify
    flask run --host=$HOST --port $PORT
else
    cd /app
    gunicorn yangify.app:app \
             --bind $HOST:$PORT \
             --workers $NUM_WORKERS \
             --max-requests 500 \
             --max-requests-jitter 100
fi
