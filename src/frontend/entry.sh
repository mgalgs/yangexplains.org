#!/bin/sh

echo "have id:"
id

[[ -d /code ]] || {
    echo "/code not found. Did you volume-mount the frontend code into /code?"
    exit 1
}

cd /code

npm install
npm run dev
