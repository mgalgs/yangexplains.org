#!/bin/sh

[[ -e /code/package.json ]] || {
    echo "package.json not found. Did you volume-mount the frontend code into /code?"
    exit 1
}

npm install
npm run dev
