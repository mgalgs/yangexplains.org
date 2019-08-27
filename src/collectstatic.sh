#!/bin/bash

cd $(dirname $0)

cat <<EOF
Mounts:
$PWD/collectstatic:/code
$PWD/backend/yangify/static:/static

EOF

docker run \
       --rm \
       -v $PWD/collectstatic:/code \
       -v $PWD/backend/yangify/static:/static \
       --user $(id -u):$(id -g) \
       python:3.7.4-buster \
       python -u /code/collect.py
